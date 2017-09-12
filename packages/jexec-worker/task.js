function task (data) {
  return { value: +data.value + 1 }
}

module.exports = function (data, callback) {
  try {
    const result = task(data)
    callback(null, result)
  } catch (error) {
    callback(error)
  }
}