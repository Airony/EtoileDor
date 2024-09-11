export const isAdmin = ({ req: { user } }) => user && user.role === "admin";
