//Helpers for handle bars rendering

exports.ifNotEquals = (str1, str2, id, options) => {
    return (str1 !== str2) ? options.fn(id) : ''
}