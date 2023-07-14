import Button from '@mui/material/Button';

function Login() {

  return (
    <>
		<Button variant="outlined" startIcon={<AddCommentIcon />} onClick={() => navigate('/createRoom')}>
            Login
        </Button>
    </>
  )

}

export default Login
