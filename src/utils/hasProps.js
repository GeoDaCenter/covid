export const hasProps = (obj, props) => {
    for (let i=0; i<props.length; i++) {
        if (!(props[i] in obj)) {
            return false;
        }
    }
    return true
}