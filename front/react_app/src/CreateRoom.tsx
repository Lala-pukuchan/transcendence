import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import { FormControl, InputLabel, Input, FormHelperText, FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, OutlinedInput, InputAdornment, Box, Button } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function CreateRoom() {

  const [value, setValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormControl>
          
          <InputLabel htmlFor="my-input">Room Name</InputLabel>
          <Input id="my-input" aria-describedby="my-helper-text" />
          <FormHelperText id="my-helper-text">Please input roomName.</FormHelperText>
          
          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Type1</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel value="room" control={<Radio />} label="Room" />
            <FormControlLabel value="dm" control={<Radio />} label="DM" />
          </RadioGroup>

          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Type2</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel value="public" control={<Radio />} label="Public" />
            <FormControlLabel value="private" control={<Radio />} label="Private" />
            <FormControlLabel value="protected" control={<Radio />} label="Protected" />
          </RadioGroup>

          <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            <FormHelperText id="my-helper-text2">Please input password when creating protected in Type2.</FormHelperText>
          </FormControl>
          
          <Button variant="contained" endIcon={<AddCommentIcon />} sx={{ m: 2 }}>
            CREATE ROOM
          </Button>
        </FormControl>
      </Box>
    </>
  )
}

export default CreateRoom
