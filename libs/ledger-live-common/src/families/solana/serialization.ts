import { SolanaResources, SolanaResourcesRaw } from "./types";

export function toSolanaResourcesRaw(
  resources: SolanaResources
): SolanaResourcesRaw {
  return resources;
}

export function fromSolanaResourcesRaw(
  resourcesRaw: SolanaResourcesRaw
): SolanaResources {
  return resourcesRaw;
}
