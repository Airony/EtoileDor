const disallowConcurrency = (fn, msg) => {
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
