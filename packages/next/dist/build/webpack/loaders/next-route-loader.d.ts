import type { webpack } from 'next/dist/compiled/webpack/webpack';
/**
 * The options for the route loader.
 */
declare type RouteLoaderOptions = {
    /**
     * The page name for this particular route.
     */
    page: string;
    /**
     * The preferred region for this route.
     */
    preferredRegion: string | string[] | undefined;
    /**
     * The absolute path to the userland page file.
     */
    absolutePagePath: string;
};
/**
 * Returns the loader entry for a given page.
 *
 * @param query the options to create the loader entry
 * @returns the encoded loader entry
 */
export declare function getRouteLoaderEntry(query: RouteLoaderOptions): string;
/**
 * Handles the `next-route-loader` options.
 * @returns the loader definition function
 */
declare const loader: webpack.LoaderDefinitionFunction<RouteLoaderOptions>;
export default loader;
