import type {
	BetterFetch,
	BetterFetchOption,
	BetterFetchPlugin,
} from "@better-fetch/fetch";
import type { BetterAuthPlugin } from "../types/plugins";
import type { Atom } from "nanostores";
import type { LiteralString, UnionToIntersection } from "../types/helper";
import type { Auth } from "../auth";
import type { InferRoutes } from "./path-to-object";

export type AtomListener = {
	matcher: (path: string) => boolean;
	signal: string;
};

export interface AuthClientPlugin {
	id: LiteralString;
	/**
	 * only used for type inference. don't pass the
	 * actual plugin
	 */
	$InferServerPlugin?: BetterAuthPlugin;
	/**
	 * Custom actions
	 */
	getActions?: ($fetch: BetterFetch) => Record<string, any>;
	/**
	 * State atoms that'll be resolved by each framework
	 * auth store.
	 */
	getAtoms?: ($fetch: BetterFetch) => Record<string, Atom<any>>;
	/**
	 * specify path methods for server plugin inferred
	 * endpoints to force a specific method.
	 */
	pathMethods?: Record<string, "POST" | "GET">;
	/**
	 * Better fetch plugins
	 */
	fetchPlugins?: BetterFetchPlugin[];
	/**
	 * a list of recaller based on a matcher function.
	 * The signal name needs to match a signal in this
	 * plugin or any plugin the user might have added.
	 */
	atomListeners?: AtomListener[];
}

export interface ClientOptions {
	fetchOptions?: BetterFetchOption;
	plugins?: AuthClientPlugin[];
}

export type InferClientAPI<O extends ClientOptions> = InferRoutes<
	O["plugins"] extends Array<any>
		? (O["plugins"] extends Array<infer Pl>
				? UnionToIntersection<
						Pl extends {
							$InferServerPlugin: infer Plug;
						}
							? Plug extends BetterAuthPlugin
								? Plug["endpoints"]
								: {}
							: {}
					>
				: {}) &
				Auth["api"]
		: Auth["api"]
>;

export type InferActions<O extends ClientOptions> = O["plugins"] extends Array<
	infer Plugin
>
	? UnionToIntersection<
			Plugin extends AuthClientPlugin
				? Plugin["getActions"] extends ($fetch: BetterFetch) => infer Actions
					? Actions
					: {}
				: {}
		>
	: {};
/**
 * signals are just used to recall a computed value. as a
 * convention they start with "_"
 */
export type IsSignal<T> = T extends `_${infer _}` ? true : false;