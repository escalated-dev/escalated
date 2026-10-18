/** Shared props remain supported; Inertia 3's explicit values take precedence. */
export function readFlash(page) {
    return { ...page?.props?.flash, ...page?.flash };
}
