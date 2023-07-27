import * as React from 'react';
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

function not(a: readonly { username: string, diplayName: string }[], b: readonly { username: string, diplayName: string }[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly { username: string, diplayName: string }[], b: readonly { username: string, diplayName: string }[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: readonly { username: string, diplayName: string }[], b: readonly { username: string, diplayName: string }[]) {
  return [...a, ...not(b, a)];
}

const TransferList = (props) => {

	// フレンズ情報
  const { friendsList } = props;
  console.log('friendsList: ', friendsList);

  const [checked, setChecked] = React.useState<readonly { username: string, diplayName: string }[]>([]);
  const [left, setLeft] = React.useState<readonly { username: string, diplayName: string }[]>([
    { username: 'user1', displayName: 'userA' },
    { username: 'user2', displayName: 'userB' },
    { username: 'user3', displayName: 'userC' },
  ]);
  const [right, setRight] = React.useState<readonly { username: string, diplayName: string }[]>([
    { username: 'user4', displayName: 'userD' },
    { username: 'user5', displayName: 'userE' },
    { username: 'user6', displayName: 'userF' },
  ]);

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

  const numberOfChecked = (items: readonly { username: string, diplayName: string }[]) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: readonly { username: string, diplayName: string }[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, items: readonly { username: string, displayName: string }[]) => (
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
              <ListItemText id={labelId} primary={`List item ${item.displayName}`} />
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
