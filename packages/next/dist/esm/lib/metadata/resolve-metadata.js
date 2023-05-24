import { createDefaultMetadata } from "./default-metadata";
import { resolveOpenGraph, resolveTwitter } from "./resolvers/resolve-opengraph";
import { resolveTitle } from "./resolvers/resolve-title";
import { resolveAsArrayOrUndefined } from "./generate/utils";
import { isClientReference } from "../client-reference";
import { getLayoutOrPageModule } from "../../server/lib/app-dir-module";
import { interopDefault } from "../interop-default";
import { resolveAlternates, resolveAppleWebApp, resolveAppLinks, resolveRobots, resolveThemeColor, resolveVerification, resolveViewport } from "./resolvers/resolve-basics";
import { resolveIcons } from "./resolvers/resolve-icons";
import { getTracer } from "../../server/lib/trace/tracer";
import { ResolveMetadataSpan } from "../../server/lib/trace/constants";
import { PAGE_SEGMENT_KEY } from "../../shared/lib/constants";
function mergeStaticMetadata(metadata, staticFilesMetadata) {
    if (!staticFilesMetadata) return;
    const { icon , apple , openGraph , twitter , manifest  } = staticFilesMetadata;
    if (icon || apple) {
        metadata.icons = {
            icon: icon || [],
            apple: apple || []
        };
    }
    if (twitter) {
        const resolvedTwitter = resolveTwitter({
            ...metadata.twitter,
            images: twitter
        }, metadata.metadataBase);
        metadata.twitter = resolvedTwitter;
    }
    if (openGraph) {
        const resolvedOpenGraph = resolveOpenGraph({
            ...metadata.openGraph,
            images: openGraph
        }, metadata.metadataBase);
        metadata.openGraph = resolvedOpenGraph;
    }
    if (manifest) {
        metadata.manifest = manifest;
    }
    return metadata;
}
// Merge the source metadata into the resolved target metadata.
function merge({ target , source , staticFilesMetadata , titleTemplates , options  }) {
    // If there's override metadata, prefer it otherwise fallback to the default metadata.
    const metadataBase = typeof (source == null ? void 0 : source.metadataBase) !== "undefined" ? source.metadataBase : target.metadataBase;
    for(const key_ in source){
        const key = key_;
        switch(key){
            case "title":
                {
                    target.title = resolveTitle(source.title, titleTemplates.title);
                    break;
                }
            case "alternates":
                {
                    target.alternates = resolveAlternates(source.alternates, metadataBase, {
                        pathname: options.pathname
                    });
                    break;
                }
            case "openGraph":
                {
                    target.openGraph = resolveOpenGraph(source.openGraph, metadataBase);
                    if (target.openGraph) {
                        target.openGraph.title = resolveTitle(target.openGraph.title, titleTemplates.openGraph);
                    }
                    break;
                }
            case "twitter":
                {
                    target.twitter = resolveTwitter(source.twitter, metadataBase);
                    if (target.twitter) {
                        target.twitter.title = resolveTitle(target.twitter.title, titleTemplates.twitter);
                    }
                    break;
                }
            case "verification":
                target.verification = resolveVerification(source.verification);
                break;
            case "viewport":
                {
                    target.viewport = resolveViewport(source.viewport);
                    break;
                }
            case "icons":
                {
                    target.icons = resolveIcons(source.icons);
                    break;
                }
            case "appleWebApp":
                target.appleWebApp = resolveAppleWebApp(source.appleWebApp);
                break;
            case "appLinks":
                target.appLinks = resolveAppLinks(source.appLinks);
                break;
            case "robots":
                {
                    target.robots = resolveRobots(source.robots);
                    break;
                }
            case "themeColor":
                {
                    target.themeColor = resolveThemeColor(source.themeColor);
                    break;
                }
            case "archives":
            case "assets":
            case "bookmarks":
            case "keywords":
                {
                    target[key] = resolveAsArrayOrUndefined(source[key]);
                    break;
                }
            case "authors":
                {
                    target[key] = resolveAsArrayOrUndefined(source.authors);
                    break;
                }
            // directly assign fields that fallback to null
            case "applicationName":
            case "description":
            case "generator":
            case "creator":
            case "publisher":
            case "category":
            case "classification":
            case "referrer":
            case "colorScheme":
            case "itunes":
            case "formatDetection":
            case "manifest":
                // @ts-ignore TODO: support inferring
                target[key] = source[key] || null;
                break;
            case "other":
                target.other = Object.assign({}, target.other, source.other);
                break;
            case "metadataBase":
                target.metadataBase = metadataBase;
                break;
            default:
                break;
        }
    }
    mergeStaticMetadata(target, staticFilesMetadata);
}
async function getDefinedMetadata(mod, props, route) {
    // Layer is a client component, we just skip it. It can't have metadata exported.
    // Return early to avoid accessing properties error for client references.
    if (isClientReference(mod)) {
        return null;
    }
    return (mod.generateMetadata ? (parent)=>getTracer().trace(ResolveMetadataSpan.generateMetadata, {
            spanName: `generateMetadata ${route}`,
            attributes: {
                "next.page": route
            }
        }, ()=>mod.generateMetadata(props, parent)) : mod.metadata) || null;
}
async function collectStaticImagesFiles(metadata, props, type) {
    var _ref;
    if (!(metadata == null ? void 0 : metadata[type])) return undefined;
    const iconPromises = metadata[type].map(async (imageModule)=>interopDefault(await imageModule(props)));
    return (iconPromises == null ? void 0 : iconPromises.length) > 0 ? (_ref = await Promise.all(iconPromises)) == null ? void 0 : _ref.flat() : undefined;
}
async function resolveStaticMetadata(components, props) {
    const { metadata  } = components;
    if (!metadata) return null;
    const [icon, apple, openGraph, twitter] = await Promise.all([
        collectStaticImagesFiles(metadata, props, "icon"),
        collectStaticImagesFiles(metadata, props, "apple"),
        collectStaticImagesFiles(metadata, props, "openGraph"),
        collectStaticImagesFiles(metadata, props, "twitter")
    ]);
    const staticMetadata = {
        icon,
        apple,
        openGraph,
        twitter,
        manifest: metadata.manifest
    };
    return staticMetadata;
}
// [layout.metadata, static files metadata] -> ... -> [page.metadata, static files metadata]
export async function collectMetadata({ tree , metadataItems: array , props , route  }) {
    const [mod, modType] = await getLayoutOrPageModule(tree);
    if (modType) {
        route += `/${modType}`;
    }
    const staticFilesMetadata = await resolveStaticMetadata(tree[2], props);
    const metadataExport = mod ? await getDefinedMetadata(mod, props, route) : null;
    array.push([
        metadataExport,
        staticFilesMetadata
    ]);
}
export async function resolveMetadata({ tree , parentParams , metadataItems , treePrefix =[] , getDynamicParamFromSegment , searchParams  }) {
    const [segment, parallelRoutes, { page  }] = tree;
    const currentTreePrefix = [
        ...treePrefix,
        segment
    ];
    const isPage = typeof page !== "undefined";
    // Handle dynamic segment params.
    const segmentParam = getDynamicParamFromSegment(segment);
    /**
   * Create object holding the parent params and current params
   */ const currentParams = // Handle null case where dynamic param is optional
    segmentParam && segmentParam.value !== null ? {
        ...parentParams,
        [segmentParam.param]: segmentParam.value
    } : parentParams;
    const layerProps = {
        params: currentParams,
        ...isPage && {
            searchParams
        }
    };
    await collectMetadata({
        tree,
        metadataItems,
        props: layerProps,
        route: currentTreePrefix// __PAGE__ shouldn't be shown in a route
        .filter((s)=>s !== PAGE_SEGMENT_KEY).join("/")
    });
    for(const key in parallelRoutes){
        const childTree = parallelRoutes[key];
        await resolveMetadata({
            tree: childTree,
            metadataItems,
            parentParams: currentParams,
            treePrefix: currentTreePrefix,
            searchParams,
            getDynamicParamFromSegment
        });
    }
    return metadataItems;
}
export async function accumulateMetadata(metadataItems, options) {
    const resolvedMetadata = createDefaultMetadata();
    const resolvers = [];
    const generateMetadataResults = [];
    let titleTemplates = {
        title: null,
        twitter: null,
        openGraph: null
    };
    // Loop over all metadata items again, merging synchronously any static object exports,
    // awaiting any static promise exports, and resolving parent metadata and awaiting any generated metadata
    let resolvingIndex = 0;
    for(let i = 0; i < metadataItems.length; i++){
        const [metadataExport, staticFilesMetadata] = metadataItems[i];
        let metadata = null;
        if (typeof metadataExport === "function") {
            if (!resolvers.length) {
                for(let j = i; j < metadataItems.length; j++){
                    const [preloadMetadataExport] = metadataItems[j];
                    // call each `generateMetadata function concurrently and stash their resolver
                    if (typeof preloadMetadataExport === "function") {
                        generateMetadataResults.push(preloadMetadataExport(new Promise((resolve)=>{
                            resolvers.push(resolve);
                        })));
                    }
                }
            }
            const resolveParent = resolvers[resolvingIndex];
            const generatedMetadata = generateMetadataResults[resolvingIndex++];
            // In dev we clone and freeze to prevent relying on mutating resolvedMetadata directly.
            // In prod we just pass resolvedMetadata through without any copying.
            const currentResolvedMetadata = process.env.NODE_ENV === "development" ? Object.freeze(require("./clone-metadata").cloneMetadata(resolvedMetadata)) : resolvedMetadata;
            // This resolve should unblock the generateMetadata function if it awaited the parent
            // argument. If it didn't await the parent argument it might already have a value since it was
            // called concurrently. Regardless we await the return value before continuing on to the next layer
            resolveParent(currentResolvedMetadata);
            metadata = generatedMetadata instanceof Promise ? await generatedMetadata : generatedMetadata;
        } else if (metadataExport !== null && typeof metadataExport === "object") {
            // This metadataExport is the object form
            metadata = metadataExport;
        }
        merge({
            options,
            target: resolvedMetadata,
            source: metadata,
            staticFilesMetadata,
            titleTemplates
        });
        // If the layout is the same layer with page, skip the leaf layout and leaf page
        // The leaf layout and page are the last two items
        if (i < metadataItems.length - 2) {
            var _resolvedMetadata_title, _resolvedMetadata_openGraph, _resolvedMetadata_openGraph_title, _resolvedMetadata_twitter, _resolvedMetadata_twitter_title;
            titleTemplates = {
                title: ((_resolvedMetadata_title = resolvedMetadata.title) == null ? void 0 : _resolvedMetadata_title.template) || null,
                openGraph: ((_resolvedMetadata_openGraph = resolvedMetadata.openGraph) == null ? void 0 : (_resolvedMetadata_openGraph_title = _resolvedMetadata_openGraph.title) == null ? void 0 : _resolvedMetadata_openGraph_title.template) || null,
                twitter: ((_resolvedMetadata_twitter = resolvedMetadata.twitter) == null ? void 0 : (_resolvedMetadata_twitter_title = _resolvedMetadata_twitter.title) == null ? void 0 : _resolvedMetadata_twitter_title.template) || null
            };
        }
    }
    return resolvedMetadata;
}

//# sourceMappingURL=resolve-metadata.js.map