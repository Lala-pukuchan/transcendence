import Button from '@mui/material/Button';

function Login() {

  const authUrl = import.meta.env.VITE_API_BASE_URL + "auth/login";

  return (
    <>
      <Button variant="contained" color="success" size="large" href={authUrl}>
        Login
      </Button>
    </>
  )

}

export default Login
