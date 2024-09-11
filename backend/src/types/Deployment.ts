type l1 = {
    status: "error";
    error: string;
    date: Date;
};

type l2 = {
    status: "null";
};

type l4 = {
    status: "loading";
    date: Date;
};
type l3 = {
    status: "completed";
    date: Date;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Locals {
            deployment: Deployment;
        }
    }
}

type Deployment = l1 | l2 | l3 | l4;
export type { Deployment };
