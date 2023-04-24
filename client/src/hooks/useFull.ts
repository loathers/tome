import { Full, Placeholder, PlaceholderTypes } from "../makeValue";
import { useFunctionInternal } from "./useCall";

function useFull<T extends PlaceholderTypes>(
  thing: Placeholder<T>
): Full<T> | undefined {
  return useFunctionInternal<Full<T> | undefined>(
    "identity",
    [thing],
    undefined
  );
}

export default useFull;
