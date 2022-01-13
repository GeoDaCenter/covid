export const findNextIndex = ({
    currDatesAvailable,
    currDateIndex,
    step=1,
}) => {
    if (!currDatesAvailable) return false;
    let i = currDateIndex + step;
    while (i < currDatesAvailable.length) {
        if (currDatesAvailable[i]) return i;
        i += step;
    }
    return false
}

export const findPreviousIndex = ({
    currDatesAvailable,
    currDateIndex,
    step=1,
}) => {
    if (!currDatesAvailable) return false;
    let i = currDateIndex - step;
    while (i > 0) {
        if (currDatesAvailable[i]) return i;
        i -= step;
    }
    return false
}