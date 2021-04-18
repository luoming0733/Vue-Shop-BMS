/** 自定义表单验证规则
 *
 */

export function checkPhone (rule, value, callback) {
  if (!value) {
    return callback(new Error('请输入手机号码'))
  } else {
    const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
    console.log(reg.test(value))
    if (reg.test(value)) {
      callback()
    } else {
      return callback(new Error('请输入正确的手机号'))
    }
  }
}
