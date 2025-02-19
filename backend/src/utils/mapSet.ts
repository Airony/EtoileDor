export default function mapSet<T, U>(
    map: Map<T, U>,
    key: T,
    updateFunc: (value: U) => U,
) {
    return new Map(map).set(key, updateFunc(map.get(key)));
}
