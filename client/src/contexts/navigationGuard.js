export const runNavigationGuard = (guard, action) => {
    if (guard && guard() === false) return false;
    action();
    return true;
};
