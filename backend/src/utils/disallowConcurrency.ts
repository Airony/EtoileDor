type fn = (...args: unknown[]) => Promise<unknown>;

const disallowConcurrency = (fn: fn, msg: string): fn => {
    let locked = false;

    return (...args) => {
        if (locked) {
            return Promise.reject(msg);
        }
        locked = true;
        return fn(...args).finally(() => {
            locked = false;
        });
    };
};

export default disallowConcurrency;
