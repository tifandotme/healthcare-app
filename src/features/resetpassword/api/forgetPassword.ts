export function forgetPassword(email: string) {
  var requestOptions = {
    method: "POST",
    body: JSON.stringify({
      email: email,
    }),
  }
  return fetch(`${process.env.BASE_URL}/v1/auth/forgot-token`, requestOptions)
}
