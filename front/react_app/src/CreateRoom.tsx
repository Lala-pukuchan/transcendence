import * as React from 'react';
import { ChangeEvent, useState, useEffect } from 'react';
import { FormControl, InputLabel, Input, FormHelperText, FormLabel, RadioGroup, FormControlLabel, Radio, IconButton, OutlinedInput, InputAdornment, Box, Button } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckIcon from '@mui/icons-material/Check';

function CreateRoom() {

  const [roomType, setroomType] = useState("");
  const [accessLevel, setaccessLevel] = useState("");
  const [password, setPassword] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setroomType((event.target as HTMLInputElement).value);
  };

  const handleAccessChange = (event: ChangeEvent<HTMLInputElement>) => {
    setaccessLevel((event.target as HTMLInputElement).value);
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const isInputComplete = () => {
    return roomType == "room" && accessLevel && (accessLevel !== "protected" || password);
  };
  

  // 正規表現を使って、入力値が英語の文字または一部の記号であることを確認します。
  const handlePasswordChange = (event) => {
      const newValue = event.target.value;
       if (/^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]*$/.test(newValue)) {
      setPassword(newValue);
      } else {
      alert("Passwords must be alphanumeric characters or some symbols");
      }
    };

  return (
    <>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormControl>
          
          {roomType === "room" && (
            <div>
                <InputLabel htmlFor="my-input">Room Name</InputLabel>
                <Input id="my-input" aria-describedby="my-helper-text" />
                <FormHelperText id="my-helper-text">Please input roomName.</FormHelperText>
            </div>
        )}
          
          <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Room Type</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={roomType}
            onChange={handleTypeChange}
          >
            <FormControlLabel value="room" control={<Radio />} label="Room" />
            <FormControlLabel value="dm" control={<Radio />} label="DM" />
          </RadioGroup>

          {roomType === "room" && (
            <div>
              <FormLabel id="demo-controlled-radio-buttons-group" sx={{ m: 2 }}>Access Level</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={accessLevel}
                onChange={handleAccessChange}
              >
                <FormControlLabel value="public" control={<Radio />} label="Public" />
                <FormControlLabel value="private" control={<Radio />} label="Private" />
                <FormControlLabel value="protected" control={<Radio />} label="Protected" />
              </RadioGroup>
            </div>
          )}

            {accessLevel === "protected" && roomType == "room" && (
            <div>
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
                  value={password}
                  onChange={handlePasswordChange}
                  label="Password"
                />
                <FormHelperText id="my-helper-text2">You can protect your channel by password</FormHelperText>
              </FormControl>
            </div>
          )}
        </FormControl>
      </Box>
      <Button variant="contained" endIcon={<CheckIcon />} sx={{ m: 2 }} disabled={!isInputComplete()}>
        Create
      </Button>
    </>
  )
}

export default CreateRoom
