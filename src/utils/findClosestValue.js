
export const findDateIncrement = (index, availableDates) => {
    for (let i=index; i<availableDates.length; i++) {
        if (availableDates[i] === 1) {
        return i;
        }
    }
    return null
}

export const findDateDecrement = (index, availableDates) => {
    for (let i=index; i>=0; i--) {
        if (availableDates[i] === 1) {
        return i;
        }
    }
    return null
}

export const findClosestValue = (index, availableDates, decrement=false) => {
    if (!availableDates || !availableDates.length){
        return index
    }

    if (decrement) {
        const decremnentAttempt = findDateDecrement(index, availableDates);
        if (decremnentAttempt !== null) return decremnentAttempt
        const incrementAttempt = findDateIncrement(index, availableDates);
        if (incrementAttempt !== null) return incrementAttempt
    } else {
        const incrementAttempt = findDateIncrement(index, availableDates);
        if (incrementAttempt !== null) return incrementAttempt
        const decremnentAttempt = findDateDecrement(index, availableDates);
        if (decremnentAttempt !== null) return decremnentAttempt
    }
    return index
}