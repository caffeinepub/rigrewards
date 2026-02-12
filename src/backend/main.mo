import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Transaction types
  public type Transaction = {
    id : Text;
    amount : Nat;
    from : Principal;
    to : Principal;
    status : TransactionStatus;
    transactionType : TransactionType;
    timestamp : Time.Time;
  };

  public type TransactionStatus = {
    #pending;
    #approved;
    #completed;
    #rejected : Text;
    #autoCompleted;
    #autoCompletedRejected;
  };

  public type TransactionType = {
    #deposit;
    #internalTransfer;
    #purchase;
  };

  module Transaction {
    public func compare(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      Int.compare(transaction1.timestamp, transaction2.timestamp);
    };
  };

  type DepositRequest = {
    id : Text;
    user : Principal;
    amount : Nat;
    timestamp : Time.Time;
    status : DepositStatus;
  };

  type DepositStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Wallet = {
    balance : Nat;
  };

  let transactions = Map.empty<Text, Transaction>();
  let depositRequests = Map.empty<Text, DepositRequest>();
  let wallets = Map.empty<Principal, Wallet>();

  // Wallet Management
  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };
    switch (wallets.get(caller)) {
      case (?wallet) { wallet.balance };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getWalletBalance(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other user balances");
    };
    switch (wallets.get(user)) {
      case (?wallet) { wallet.balance };
      case (null) { 0 };
    };
  };

  // Deposit Management
  public shared ({ caller }) func createDepositRequest(amount : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create deposit requests");
    };
    let id = Time.now().toText() # caller.toText();
    let depositRequest : DepositRequest = {
      id;
      user = caller;
      amount;
      timestamp = Time.now();
      status = #pending;
    };
    depositRequests.add(id, depositRequest);
    id;
  };

  public query ({ caller }) func getDepositRequests() : async [DepositRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view deposit requests");
    };
    depositRequests.values().toArray();
  };

  public shared ({ caller }) func approveDepositRequest(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve deposits");
    };
    let depositRequest = switch (depositRequests.get(id)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?depositRequest) { depositRequest };
    };
    switch (depositRequest.status) {
      case (#approved) { Runtime.trap("Deposit already approved") };
      case (#rejected) { Runtime.trap("Cannot approve a rejected deposit") };
      case (#pending) { () };
    };

    // Update deposit request status
    let updatedDepositRequest = {
      depositRequest with status = #approved;
    };
    depositRequests.add(id, updatedDepositRequest);

    // Update user wallet balance
    let currentBalance = switch (wallets.get(depositRequest.user)) {
      case (null) { 0 };
      case (?wallet) { wallet.balance };
    };

    let updatedWallet = {
      balance = currentBalance + depositRequest.amount;
    };
    wallets.add(depositRequest.user, updatedWallet);

    // Record the deposit transaction
    let transaction : Transaction = {
      id;
      amount = depositRequest.amount;
      from = depositRequest.user;
      to = caller;
      status = #approved;
      transactionType = #deposit;
      timestamp = Time.now();
    };
    transactions.add(id, transaction);
  };

  // Internal Transfer
  public shared ({ caller }) func transferFunds(recipient : Principal, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can transfer funds");
    };
    // Check if sender has sufficient balance
    let senderBalance = switch (wallets.get(caller)) {
      case (null) { 0 };
      case (?wallet) { wallet.balance };
    };

    if (senderBalance < amount) {
      Runtime.trap("Insufficient balance");
    };

    // Deduct amount from sender's wallet
    let updatedSenderWallet = {
      balance = senderBalance - amount;
    };
    wallets.add(caller, updatedSenderWallet);

    // Credit amount to recipient's wallet
    let recipientBalance = switch (wallets.get(recipient)) {
      case (null) { 0 };
      case (?wallet) { wallet.balance };
    };

    let updatedRecipientWallet = {
      balance = recipientBalance + amount;
    };
    wallets.add(recipient, updatedRecipientWallet);

    let transaction : Transaction = {
      id = Time.now().toText() # caller.toText();
      amount;
      from = caller;
      to = recipient;
      status = #completed;
      transactionType = #internalTransfer;
      timestamp = Time.now();
    };
    transactions.add(transaction.id, transaction);
  };

  // Transaction Management
  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.values().toArray().sort();
  };

  public query ({ caller }) func getUserTransactions(user : Principal) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };
    transactions.values().filter(
      func(t) {
        t.from == user or t.to == user;
      }
    ).toArray().sort();
  };
};
