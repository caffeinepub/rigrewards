import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TransactionStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "autoCompleted";
    autoCompleted: null;
} | {
    __kind__: "completed";
    completed: null;
} | {
    __kind__: "approved";
    approved: null;
} | {
    __kind__: "autoCompletedRejected";
    autoCompletedRejected: null;
} | {
    __kind__: "rejected";
    rejected: string;
};
export type Time = bigint;
export interface DepositRequest {
    id: string;
    status: DepositStatus;
    user: Principal;
    timestamp: Time;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: string;
    to: Principal;
    status: TransactionStatus;
    transactionType: TransactionType;
    from: Principal;
    timestamp: Time;
    amount: bigint;
}
export enum DepositStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum TransactionType {
    deposit = "deposit",
    internalTransfer = "internalTransfer",
    purchase = "purchase"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveDepositRequest(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDepositRequest(amount: bigint): Promise<string>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepositRequests(): Promise<Array<DepositRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTransactions(user: Principal): Promise<Array<Transaction>>;
    getWalletBalance(user: Principal): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transferFunds(recipient: Principal, amount: bigint): Promise<void>;
}
