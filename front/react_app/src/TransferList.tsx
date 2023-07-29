import { ReactNode, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { httpClient } from './httpClient.ts';

function not(a: readonly { username: string, displayName: string }[], b: readonly { username: string, displayName: string }[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly { username: string, displayName: string }[], b: readonly { username: string, displayName: string }[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: readonly { username: string, displayName: string }[], b: readonly { username: string, displayName: string }[]) {
  return [...a, ...not(b, a)];
}

const TransferList = (props) => {

  const [checked, setChecked] = useState<readonly { username: string, displayName: string }[]>([]);
  const { friendsList, notFriendsList, username } = props;

  // フレンズ初期代入
  const [right, setRight] = useState<readonly { username: string, displayName: string }[]>([]);
  const [left, setLeft] = useState<readonly { username: string, displayName: string }[]>([]);
  useEffect(() => {
		setRight(friendsList);
    setLeft(notFriendsList);
	}, [friendsList, notFriendsList]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: readonly { username: string, displayName: string }[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: readonly { username: string, displayName: string }[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  // フレンズ追加
  const handleCheckedRight = async () => {
    const addUserName = leftChecked.map((item) => item.username);
    try {
      const res = await httpClient.patch(`/users/${username}/addFriends`, { usernames: addUserName });
      console.log('add friends res: ', res);
      setRight(right.concat(leftChecked));
      setLeft(not(left, leftChecked));
      setChecked(not(checked, leftChecked));
    } catch (error) {
      console.log('Error adding friends:', error);
    }
  };

  // フレンズ削除
  const handleCheckedLeft = async () => {
    const deleteUserName = rightChecked.map((item) => item.username);
    try {
      const res = await httpClient.patch(`/users/${username}/deleteFriends`, { usernames: deleteUserName });
      console.log('delete friends res: ', res);
      setLeft(left.concat(rightChecked));
      setRight(not(right, rightChecked));
      setChecked(not(checked, rightChecked));
    } catch (error) {
      console.log('Error adding friends:', error);
    }
  };

  const customList = (title: ReactNode, items: readonly { username: string, displayName: string }[]) => (
    <Card>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={
              numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List
        sx={{
          width: 200,
          height: 230,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role="list"
      >
        {items.map((item) => {
        const labelId = `transfer-list-item-${item.username}-label`;

        return (
          <ListItem
              key={item.username}
              role="listitem"
              button
              onClick={handleToggle(item)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(item) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${item.displayName}`} />
          </ListItem>
        );
      })}
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item>{customList('Not Friends', left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList('Friends', right)}</Grid>
    </Grid>
  );
}

export default TransferList;
