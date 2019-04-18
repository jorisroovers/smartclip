
export function setObjectValue(target, qualifiedKey, value) {
    let keyParts = qualifiedKey.split(".");
    let subTarget = target;
    for (let i = 0; i < keyParts.length - 1; i++) {
        subTarget = subTarget[keyParts[i]];
    }
    subTarget[keyParts[Math.max(0, keyParts.length - 1)]] = value;
}


export function getObjectValue(target, qualifiedKey) {
    let keyParts = qualifiedKey.split(".");
    let subTarget = target;
    for (let i = 0; i < keyParts.length - 1; i++) {
        subTarget = subTarget[keyParts[i]];
    }
    return subTarget[keyParts[Math.max(0, keyParts.length - 1)]];
}