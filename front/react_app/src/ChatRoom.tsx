import { Button, Box, Grid, TextField, Paper, Typography, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { useRef, useEffect, useCallback, useState } from 'react';
import io from 'socket.io-client';
import { getCookie } from './utils/HandleCookie.tsx';
import { decodeToken } from "react-jwt";
import { httpClient } from './httpClient.ts';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';


// socket.ioの初期化(socketをどのタイミングで作成するかは要検討)
const socket = io('http://localhost:3000');

function ChatRoom() {
  if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}
  const reqHeader = {
    headers: {
      Authorization: `Bearer ` + getCookie('token'),
      'Content-Type': 'application/json',
    },
  };

  const navigate = useNavigate();

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;

	// ルーム情報の取得
  const location = useLocation();
  let roomId: string | null = null;
  if (location.state && location.state.room) {
    roomId = location.state.room;
  } else {
    navigate('/selectRoom');
    return null;
  }
  const [room, setRoom] = useState<any>({});

  // ルーム情報を取得する関数
  async function getRoom() {
    const res = await httpClient.get(`/channels/${roomId}/${username}/info`, reqHeader);
    setRoom(res.data);
  }

  // ページロード時にルーム情報を取得します
  useEffect(() => {
    getRoom();
    if (room.isDM) {
      getDmUser();
    }
  }, [roomId]);

  // メッセージ表示用
  const [chatLog, setChatLog] = useState<Array<any>>([]); // chatLogの型をstring[]からany[]に変更します

  // チャットの履歴を取得する関数
  async function getChatHistory() {
    try {
      const response = await httpClient.get(`/message/${roomId}`, reqHeader);
      setChatLog(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the chat history:", error);
    }
  }
  
  // ページロード時にチャットの履歴を取得します
  useEffect(() => {
    getChatHistory();
  }, []);
  
	// socket初回接続時の処理
	useEffect(() => {
    socket.on('connect', () => {
      console.log('connected', socket.id);
		});
    
		// ルームへの参加
		socket.emit('joinRoom', roomId);
		
	}, []);
  
	// メッセージ入力用
	const inputRef = useRef(null);

	// socketメッセージ送信処理
  const submitMessage = useCallback(() => {
    if (inputRef.current.value === '')
      return;

    if (room.isMuted) {
      httpClient
        .get(`/channels/${roomId}/users/${username}/is-muted`, reqHeader)
        .then((response) => {
          console.log(response);
          if (response.data.isMuted) {
            alert(`ミュートされているため残り${response.data.remainingMinutes}分メッセージを送信できません`);
            return;
          }
          else {
            getRoom();
          }
        })
        .catch((error) => {
          console.log("An error occurred:", error);
          alert("An error occurred while verifying the mute status");  // エラーメッセージを表示します
          return;
        });
    }
      
    // json形式で送信
    const message = {
      channelId: roomId,
      content: inputRef.current.value,
      username: username,
      createdAt: Date.now(),
      contents_path: ""
    }
    // メッセージ入力欄の初期化
    inputRef.current.value = '';
    // メッセージ送信
    socket.emit('message', message);
    
    // HTTP POSTリクエストでDBにメッセージを保存
    httpClient.post('/message', {
      username: username,
      channelId: roomId,
      content: message.content,
      createdAt: new Date().toISOString()
    }, reqHeader)
    .then((response) => {
      console.log("Message saved successfully:", response);
    })
    .catch((error) => {
      console.error("An error occurred while saving the message:", error);
    });
  }, []);


	// メッセージ表示用
	const [msg, setMsg] = useState('');

	// socketメッセージ受信処理
	useEffect(() => {
		socket.on('update', (message: string) => {
			setMsg(message);
		});
	}, []);

	// メッセージ履歴の表示
	useEffect(() => {
		setChatLog([...chatLog, msg]);
	}, [msg]);


	// メッセージ履歴の最下部スクロール
	const chatLogRef = useRef(null);
	useEffect(() => {
		const chatLogElement = chatLogRef.current;
		chatLogElement.scrollTop = chatLogElement.scrollHeight;
	}, [chatLog]);


	// メッセージ送信ボタンのフォーカス
	const sendButtonRef = useRef(null);
	useEffect(() => {
		const handleKeyPress = (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				sendButtonRef.current.click();
			}
		};
	
		document.addEventListener('keydown', handleKeyPress);
	
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

  const [composing, setComposing] = useState(false);

  const handleCompositionStart = () => {
    setComposing(true);
  };

  const handleCompositionEnd = () => {
    setComposing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.isComposing && !composing) {
      event.preventDefault();
      submitMessage();
    }
  };

  //以下はsubjectの機能を満たすためのchannel編集機能
  const [users, setUsers] = useState<Array<any>>([]); //User一覧
  const [selectedUsers, setSelectedUsers] = useState<Array<any>>([]); // 選択されたchannelに存在しないユーザーの状態を管理
  const [showUsers, setShowUsers] = useState(false);
  const [members, setMembers] = useState<Array<any>>([]); // チャンネルのmember一覧(adminは含まない)
  const [selectedMembers, setSelectedMembers] = useState<Array<any>>([]); // 選択されたmemberの状態を管理
  const [showMembers, setShowMembers] = useState(false);
  const [notOwners, setNotOwners] = useState<Array<any>>([]); // owner以外のchannel参加者一覧
  const [selectedNotOwners, setSelectedNotOwners] = useState<Array<any>>([]); // 選択されたowner以外のchannel参加者の状態を管理
  const [showNotOwners, setShowNotOwners] = useState(false);
  const [changePassword, setChangePassword] = useState(false); // パスワード変更の状態を管理s
  const [search, setSearch] = useState(''); // 検索文字列の状態を管理
  const [page, setPage] = useState(0);  // 現在のページ番号の状態を追加
  const [showOldPassword, setShowOldPassword] = useState(false); // 古いパスワードの表示状態を管理
  const [inputOldPassword, setInputOldPassword] = useState(''); // パスワード入力欄の状態を管理
  const [showNewPassword, setShowNewPassword] = useState(false); // 新しいパスワードの表示状態を管理
  const [inputNewPassword, setInputNewPassword] = useState(''); // パスワード入力欄の状態を管理
  const [createPassword, setCreatePassword] = useState(false); // パスワード設定の状態を管理
  const [unsetPassword, setUnsetPassword] = useState(false); // パスワード削除の状態を管理
  const [blockUser, setBlockUser] = useState(false); // ユーザーブロックの状態を管理
  const [dmUser, setDmUser] = useState(false); // DMの状態を管理
  const [leaveChannel, setLeaveChannel] = useState(false); // チャンネル退出の状態を管理
  const [selectedUser, setSelectedUser] = useState(null); // 選択されたユーザーの状態を管理
  const [banMembers, setBanMembers] = useState(false); // チャンネル退出の状態を管理
  const [muteMembers, setMuteMembers] = useState(false); // ミュートの状態を管理
  const [muteDuration, setMuteDuration] = useState(2); // ミュート時間の状態を管理
  const itemsPerPage = 10; // 1ページあたりのアイテム数
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (room.isDM)
        getDmUser();
  };
  
  const handleClose = (event) => {
    getRoom();
    closeMembers();
    closeUsers();
    closeNotOwners();
    closeChangePassword();
    closeUnsetPassword();
    closeCreatePassword();
    closeBlockUser();
    closeLeaveChannel();
    closeBanMembers();
    closeMuteMembers();

    // Only handle click events from the MenuItems
    if (event.type === "click") {
      if (event.target.textContent === "Add Users") {
        getUsersNotInChannel();
        setShowUsers(true);
      }
      else if (event.target.textContent === "Add Administrators") {
        getMembers();
        setShowMembers(true);
      }
      else if (event.target.textContent === "Kick Members") {
        getNotOwners();
        setShowNotOwners(true);
      }
      else if (event.target.textContent === "Change Password") {
        setChangePassword(true);
      }
      else if (event.target.textContent === "Unset Password") {
        setUnsetPassword(true);
      }
      else if (event.target.textContent === "Set Password") {
        setCreatePassword(true);
      }
      else if (event.target.textContent === `Block ${dmUser.username}`) {
        setBlockUser(true);
      }
      else if (event.target.textContent === "Leave Channel") {
        if (room.isOwner) {
          getNotOwners();
        }
        setLeaveChannel(true);
      }
      else if (event.target.textContent === "Ban Members") {
        getNotOwners();
        setBanMembers(true);
      }
      else if (event.target.textContent === "Mute Members") {
        getNotOwners();
        setMuteMembers(true);
      }
    }

    setAnchorEl(null);
  };

  // 特定のuserを取得する関数
  // channelに存在しないユーザー一覧を取得する関数
  async function getUsersNotInChannel() {
    try {
      const response = await httpClient.get(`/channels/${roomId}/users/not-members`, reqHeader);
      console.log('response: ', response);
      setUsers(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the users not in channel:", error);
    }
  }

  // channelのmember一覧を取得する関数
  async function getMembers() {
    try {
      const response = await httpClient.get(`/channels/${roomId}/users/members`, reqHeader);
      console.log('response: ', response);
      setMembers(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the users in channel:", error);
    }
  }

  //owner以外のchannel参加者一覧を取得する関数
  async function getNotOwners() {
    try {
      const response = await httpClient.get(`/channels/${roomId}/users/not-owners`, reqHeader);
      console.log('response: ', response);
      setNotOwners(response.data);
    } catch (error) {
      console.error("An error occurred while fetching the users in channel:", error);
    }
  }

  async function getDmUser()
  {
    try {
        const response = await httpClient.get(`/channels/${roomId}/users/${username}/dm-user`, reqHeader);
        console.log('response: ', response);
        setDmUser(response.data);
        return response.data;
    } catch (error) {
        console.error("An error occurred while fetching the users in channel:", error);
    }
  }
  

  // 特定のuserをフィルタリングする関数
  // channelに存在しないユーザーをフィルタリングする関数
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  // memberをフィルタリングする関数
  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotOwners = notOwners.filter(notOwner =>
    notOwner.username.toLowerCase().includes(search.toLowerCase())
  );
  
  //特定のuserをページングする関数
  // メンバーをフィルタリングとページングする関数
  const displayMembers = filteredMembers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // channelに存在しないユーザーをフィルタリングとページングする関数
  const displayedUsers = filteredUsers.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // owner以外のchannel参加者をフィルタリングとページングする関数
  const displayedNotOwners = filteredNotOwners.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  // チェックボックスが変更されたときに選択されたuserを追加または削除する関数
  // チェックボックスが変更されたときに選択されたmemberを追加または削除
  const handleToggleMember = (member) => {
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // チェックボックスが変更されたときに選択されたchannelに存在しないユーザーを追加または削除
  const handleToggleUser = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // チェックボックスが変更されたときに選択されたowner以外のchannel参加者を追加または削除
  const handleToggleNotOwner = (notOwner) => {
    if (selectedNotOwners.includes(notOwner)) {
      setSelectedNotOwners(selectedNotOwners.filter((n) => n !== notOwner));
    } else {
      setSelectedNotOwners([...selectedNotOwners, notOwner]);
    }
  };

  const handleToggleChangeOwner = (user) => {
    if (selectedUser && selectedUser.username === user.username) {
      setSelectedUser(null);  // すでに選択されているユーザーを再度クリックすると選択を解除
    } else {
      setSelectedUser(user);  // 新たなユーザーを選択
    }
  };

  // ダイアログを閉じる関数
  // ダイアログを閉じる関数(member)
  const closeMembers = () => {
    setSelectedMembers([]);
    setMembers([]);
    setSearch('');
    setPage(0);
    setShowMembers(false);
  };

  // ダイアログを閉じる関数(channelに存在しないuser)
  const closeUsers = () => {
    setSelectedUsers([]);
    setUsers([]);
    setSearch('');
    setPage(0);
    setShowUsers(false);
  };

  // ダイアログを閉じる関数(owner以外のchannel参加者)
  const closeNotOwners = () => {
    setSelectedNotOwners([]);
    setNotOwners([]);
    setSearch('');
    setPage(0);
    setShowNotOwners(false);
  };

  const closeBanMembers = () => {
    setSelectedNotOwners([]);
    setNotOwners([]);
    setSearch('');
    setPage(0);
    setBanMembers(false);
  }

  const closeMuteMembers = () => {
    setSelectedNotOwners([]);
    setNotOwners([]);
    setSearch('');
    setPage(0);
    setMuteMembers(false);
  }

  const closeChangePassword = () => {
    setChangePassword(false);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setInputOldPassword('');
    setInputNewPassword('');
  };

  const closeUnsetPassword = () => {
    setUnsetPassword(false);
    setShowOldPassword(false);
    setInputOldPassword('');
  };

  const closeCreatePassword = () => {
    setCreatePassword(false);
    setShowNewPassword(false);
    setInputNewPassword('');
  }

  const closeBlockUser = () => {
    setBlockUser(false);
  }

  const closeLeaveChannel = () => {
    setSelectedUser(null);
    setLeaveChannel(false);
  }

  // member管理を行う関数
  // チャンネルにmemberからadminを追加する関数
  const handleAddAdmin = async () => {
    try {
      await Promise.all(
        selectedMembers.map((member) =>
          httpClient.post(`/channels/${roomId}/users/admins`, {
            username: member.username,
          }, reqHeader)
        )
      );

      console.log("Admins added successfully.");
      // 通知メッセージを表示するなど、ここで成功時の処理を追加できます。
    } catch (error) {
      console.error("An error occurred while adding the admins to the channel:", error);
    }
    closeMembers();
  };

  // チャンネルに存在しないuserを追加
  const handleAddUser = async () => {
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          httpClient.post(`/channels/${roomId}/users`, {
            username: user.username,
          }, reqHeader)
        )
      );
      console.log("Users added successfully.");
      // 通知メッセージを表示するなど、ここで成功時の処理を追加できます。
    } catch (error) {
      console.error("An error occurred while adding the users to the channel:", error);
    }
    closeUsers();
  };

  // チャンネルからmemberを削除する関数
  const handleRemoveMember = async () => {
    try {
      await Promise.all(
        selectedNotOwners.map((notOwner) =>
          httpClient.delete(`/channels/${roomId}/users/${notOwner.username}`, reqHeader)
        )
      );
      console.log("Members removed successfully.");
      // 通知メッセージを表示するなど、ここで成功時の処理を追加できます。
    }
    catch (error) {
      console.error("An error occurred while removing the members from the channel:", error);
    }
    closeNotOwners();
    getRoom();
  };

  const toggleShowPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handlePasswordSubmit = () => {
    httpClient
      .post(`/channels/${roomId}/verifyPassword`, { password: inputOldPassword }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        if (response.data.isValid) {
          // パスワードが正しい場合、ここでパスワードを変更します
          httpClient
            .patch(`/channels/${roomId}/change-password`, { oldPassword: inputOldPassword, newPassword: inputNewPassword }, reqHeader)
            .then((response) => {
              console.log(response);  // レスポンスをログ出力
              alert("パスワードを変更しました");  // 成功メッセージを表示します
              getRoom();
              closeChangePassword();  // ダイアログを閉じます
            })
            .catch((error) => {
              console.log("An error occurred:", error);
              alert("An error occurred while changing the password");  // エラーメッセージを表示します
            });
        } else {
          // パスワードが間違っている場合、ここでエラーメッセージを表示します
          alert("パスワードが間違っています");
        }
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while verifying the password");  // エラーメッセージを表示します
      });
      getRoom();
  };

  const handleUnsetPassword = () => {
    httpClient
      .post(`/channels/${roomId}/verifyPassword`, { password: inputOldPassword }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        if (response.data.isValid) {
          // パスワードが正しい場合、ここでパスワードを削除します
          httpClient
            .patch(`/channels/${roomId}/unset-password`, { password: inputOldPassword}, reqHeader)
            .then((response) => {
              console.log(response);
              alert("パスワードを削除しました");  // 成功メッセージを表示します
              getRoom();
              closeUnsetPassword();  // ダイアログを閉じます
            })
            .catch((error) => {
              console.log("An error occurred:", error);
              alert("An error occurred while changing the password");  // エラーメッセージを表示します
            });
        } else {
          // パスワードが間違っている場合、ここでエラーメッセージを表示します
          alert("パスワードが間違っています");
        }
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while verifying the password");  // エラーメッセージを表示します
      });
  };

  const handleCreatePassword = () => {
    httpClient
      .patch(`/channels/${roomId}/set-password`, { password: inputNewPassword }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        alert("パスワードを設定しました");  // 成功メッセージを表示します
        getRoom();
        closeCreatePassword();  // ダイアログを閉じます
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while setting the password");  // エラーメッセージを表示します
      });
  };

  const handleBlockUser = () => {
    httpClient
        .post(`/users/${username}/block-user`, { username: dmUser.username }, reqHeader)
        .then((response) => {
            console.log(response);  // レスポンスをログ出力
            alert("ユーザーをブロックしました");  // 成功メッセージを表示します
            getRoom();
            closeBlockUser();  // ダイアログを閉じます
            navigate('/selectRoom');
        })
        .catch((error) => {
            console.log("An error occurred:", error);
            alert("An error occurred while blocking the user");  // エラーメッセージを表示します
            alert(error);
        });
  }

  const handleLeaveChannel = () => {
    if (room.isOwner) {
      httpClient
        .delete(`/channels/${roomId}`, reqHeader)
        .then((response) => {
            console.log(response);  // レスポンスをログ出力
            alert("チャンネルを削除し、退出しました");  // 成功メッセージを表示します
            closeLeaveChannel();  // ダイアログを閉じます
            navigate('/selectRoom');
            return;
        })
        .catch((error) => {
            console.log("An error occurred:", error);
            alert("An error occurred while deleting the channel");  // エラーメッセージを表示します
            closeLeaveChannel();  // ダイアログを閉じます
            return;
        });
    } else {
      httpClient
          .delete(`/channels/${roomId}/users/${username}`, reqHeader)
          .then((response) => {
              console.log(response);  // レスポンスをログ出力
              alert("チャンネルから退出しました");  // 成功メッセージを表示します
              closeLeaveChannel();  // ダイアログを閉じます
              navigate('/selectRoom');
          })
          .catch((error) => {
              console.log("An error occurred:", error);
              alert("An error occurred while leaving the channel");  // エラーメッセージを表示します
          });
    }
  }

  const handleChangeOwner = () => {
    httpClient
      .patch(`/channels/${roomId}/change-owner`, { username: selectedUser.username }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        alert("オーナーを変更しました");  // 成功メッセージを表示します
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while changing the owner");  // エラーメッセージを表示します
        closeLeaveChannel();  // ダイアログを閉じます
        return;
      });
    httpClient
      .delete(`/channels/${roomId}/users/${username}`, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        alert("チャンネルから退出しました");  // 成功メッセージを表示します
        closeLeaveChannel();  // ダイアログを閉じます
        navigate('/selectRoom');
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while leaving the channel");  // エラーメッセージを表示します
        closeLeaveChannel();  // ダイアログを閉じます
      });
  }

  const handleBanMembers = async () => {
    try {
      await Promise.all(
        selectedNotOwners.map((notOwner) =>
          httpClient.post(`/channels/${roomId}/users/ban`, {
            username: notOwner.username,
          }, reqHeader)
        )
      );
    } catch (error) {
      console.error("An error occurred while banning the members from the channel:", error);
    }
    closeBanMembers();
    getRoom();
  }

  const handleMuteMembers = async () => {
    try {
      await Promise.all(
        selectedNotOwners.map((notOwner) =>
          httpClient.post(`/channels/${roomId}/users/mute`, {
            username: notOwner.username,
            muteDuration: muteDuration
          }, reqHeader)
        )
      );
    } catch (error) {
      console.error("An error occurred while muting the members from the channel:", error);
      alert(`${error}`);
    }
    closeMuteMembers();
    getRoom();
  }

  const inviteGame = async () => {
    const fetchedDmUser = await getDmUser();

    httpClient
      .post(`/games/invite/${username}`, { opponent: fetchedDmUser.username }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        alert("ゲームルームを作成しました");  // 成功メッセージを表示します

        let content = inputRef.current.value;

        if (content === '') {
          content = 'れっつぽんぐ！';
        }
        // json形式で送信
        const message = {
          channelId: roomId,
          content: content,
          isInvitation: true,
          isAccepted: false,
          username: username,
          createdAt: Date.now(),
          contents_path: ""
        }
        // メッセージ入力欄の初期化
        inputRef.current.value = '';
        // メッセージ送信
        socket.emit('message', message);
        
        // HTTP POSTリクエストでDBにメッセージを保存
        httpClient.post('/message', {
          username: username,
          channelId: roomId,
          isInvitation: true,
          content: message.content,
          createdAt: new Date().toISOString()
        }, reqHeader)
        .then((response) => {
          console.log("Message saved successfully:", response);
          alert("招待を送信しました");  // 成功メッセージを表示します
          navigate('/game');
        })
        .catch((error) => {
          console.error("An error occurred while saving the message:", error);
        });
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert("An error occurred while inviting the user");  // エラーメッセージを表示します
        alert(error);
        return;
      });
  }

	return (
		<>
      <IconButton
      edge="start"
      color="inherit"
      aria-label="settings"
      sx={{
        position: 'fixed',
        left: 280, // 左端からの距離を280pxに設定
        top: 70, // 上端からの距離を70pxに設定
      }}
      onClick={handleClick}
    >
      <SettingsIcon />
    </IconButton>
    <Menu
      id="settings-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      {room.isDM && <MenuItem onClick={handleClose}>Block {dmUser.username}</MenuItem>}
      {room.isAdmin && !room.isDM && <MenuItem onClick={handleClose}>Add Users</MenuItem>}
      {room.isAdmin && !room.isDM && <MenuItem onClick={handleClose}>Add Administrators</MenuItem>}
      {room.isAdmin && !room.isDM && <MenuItem onClick={handleClose}>Mute Members</MenuItem>}
      {room.isAdmin && !room.isDM && <MenuItem onClick={handleClose}>Kick Members</MenuItem>}
      {room.isAdmin && !room.isDM && <MenuItem onClick={handleClose}>Ban Members</MenuItem>}
      {room.isOwner && room.isProtected && <MenuItem onClick={handleClose}>Change Password</MenuItem>}
      {room.isOwner && !room.isDM && room.isProtected && <MenuItem onClick={handleClose}>Unset Password</MenuItem>}
      {room.isOwner && !room.isDM && room.isPublic && !room.isProtected && <MenuItem onClick={handleClose}>Set Password</MenuItem>}
      {!room.isDM && <MenuItem onClick={handleClose}>Leave Channel</MenuItem>}
    </Menu>
			<Box
				sx={{
					width: 800,
					height: "80vh",
					display: "flex",
					flexDirection: "column",
					bgcolor: "primary.dark",
				}}
				>
				<Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }} ref={chatLogRef}>
					{chatLog.map((message, index) => (
						<Message key={index} message={message} myAccountUserId={username}/>
					))}
				</Box>
				<Box sx={{ p: 2, backgroundColor: "background.default" }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={2}>
            <Button
              variant="contained"
              endIcon={<ChatIcon />}
              onClick={() => navigate('/selectRoom')}
            >
              Back
            </Button>
          </Grid>
          <Grid item xs={6}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              inputProps={{
                ref: inputRef,
                onKeyDown: handleKeyDown,
                onCompositionStart: handleCompositionStart,
                onCompositionEnd: handleCompositionEnd,
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={submitMessage}
              ref={sendButtonRef}
            >
              Send
            </Button>
          </Grid>
        <Grid item xs={2}>
          {( room.isDM &&
          <Button
            fullWidth
            color="primary"
            variant="contained"
            endIcon={<VideogameAssetIcon />}
            onClick={inviteGame}
          >
            invite
          </Button>)}
        </Grid>
        </Grid>
				</Box>
			</Box>
      <Dialog open={showUsers} onClose={() => closeUsers()}>
        <DialogTitle>Choose users to add</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayedUsers.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleUser(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddUser} 
          disabled={selectedUsers.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Add Users
        </Button>
      </Dialog>
      <Dialog open={showMembers} onClose={() => closeMembers()}>
        <DialogTitle>Choose users to add</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayMembers.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleMember(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddAdmin} 
          disabled={selectedMembers.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Add Administrators
        </Button>
      </Dialog>
      <Dialog open={showNotOwners} onClose={() => closeNotOwners()}>
        <DialogTitle>Choose users to kick</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayedNotOwners.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleNotOwner(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRemoveMember} 
          disabled={selectedNotOwners.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Kick Members
        </Button>
      </Dialog>
      <Dialog open={banMembers} onClose={() => closeBanMembers()}>
        <DialogTitle>Choose users to ban</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayedNotOwners.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleNotOwner(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBanMembers} 
          disabled={selectedNotOwners.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Ban Members
        </Button>
      </Dialog>
      <Dialog open={muteMembers} onClose={() => closeMuteMembers()}>
        <DialogTitle>Choose users to mute</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayedNotOwners.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleNotOwner(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <TextField
          label="Mute duration (minutes)"
          value={muteDuration}
          onChange={(e) => setMuteDuration(e.target.value)}
          type="number"
          inputProps={{ min: "1" }}
          sx={{ mt: 2 }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleMuteMembers} 
          disabled={selectedNotOwners.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Mute Members
        </Button>
      </Dialog>
      <Dialog open={changePassword} onClose={() => setChangePassword(false)}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Old password"
          type={showOldPassword ? "text" : "password"}  // showPasswordの値によりタイプを動的に変更します
          fullWidth
          variant="standard"
          value={inputOldPassword}
          onChange={(e) => setInputOldPassword(e.target.value)}
          InputProps={{  // このプロパティでエンドアドーンメントを追加します
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                >
                  {showOldPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          margin="dense"
          label="New password"
          type={showNewPassword ? "text" : "password"} // showNewPasswordの値によりタイプを動的に変更します
          fullWidth
          variant="standard"
          value={inputNewPassword}
          onChange={(e) => setInputNewPassword(e.target.value)}
          InputProps={{ // このプロパティでエンドアドーンメントを追加します
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowNewPassword}
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handlePasswordSubmit}
          disabled={!inputOldPassword || !inputNewPassword}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog open={unsetPassword} onClose={() => setUnsetPassword(false)}>
      <DialogTitle>Unset Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Old password"
          type={showOldPassword ? "text" : "password"}  // showPasswordの値によりタイプを動的に変更します
          fullWidth
          variant="standard"
          value={inputOldPassword}
          onChange={(e) => setInputOldPassword(e.target.value)}
          InputProps={{  // このプロパティでエンドアドーンメントを追加します
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowPassword}
                >
                  {showOldPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleUnsetPassword}
          disabled={!inputOldPassword}
        >
          Unset Password
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog open={createPassword} onClose={() => setCreatePassword(false)}>
      <DialogTitle>Set Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="password"
          type={showNewPassword ? "text" : "password"}  // showPasswordの値によりタイプを動的に変更します
          fullWidth
          variant="standard"
          value={inputNewPassword}
          onChange={(e) => setInputNewPassword(e.target.value)}
          InputProps={{  // このプロパティでエンドアドーンメントを追加します
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowNewPassword}
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCreatePassword}
          disabled={!inputNewPassword}
        >
          Set Password
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog open={showMembers} onClose={() => closeMembers()}>
        <DialogTitle>Choose users to add</DialogTitle>
        <TextField
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {displayMembers.map((user, index) => (  // フィルタリングとページングされたユーザーを表示
          <ListItem key={index}>
            <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
            <ListItemText primary={user.username} />
            <Checkbox color="primary" onChange={() => handleToggleMember(user)} />
          </ListItem>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
          <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddAdmin} 
          disabled={selectedMembers.length === 0}
          sx={{ mt: 2, mb: 2 }}
        >
          Add Administrators
        </Button>
      </Dialog>
      <Dialog open={blockUser} onClose={() => closeBlockUser()}>
        <DialogTitle>Block {dmUser.username}</DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Avatar src={import.meta.env.VITE_API_BASE_URL + "/users/" + dmUser.username + "/avatar"} />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBlockUser} 
          sx={{ mt: 2, mb: 2 }}
        >
          Block {dmUser.username}
        </Button>
      </Dialog>
      <Dialog open={leaveChannel} onClose={closeLeaveChannel}>
      <DialogTitle>Leave Channel</DialogTitle>

      {displayedNotOwners.length > 0 && room.isOwner ? (
            // Ownerを譲ってから退出する場合
          <>
              <RadioGroup value={selectedUser ? selectedUser.username : ""}>
                  {displayedNotOwners.map((user, index) => (
                      <ListItem key={index}>
                          <Avatar src={import.meta.env.VITE_API_BASE_URL + "users/" + user.username + "/avatar"} sx={{ mr: 1 }} />
                          <ListItemText primary={user.username} />
                          <FormControlLabel 
                              value={user.username} 
                              control={<Radio color="primary" />} 
                              onChange={() => handleToggleChangeOwner(user)}
                              sx={{ mr: 0 }}
                          />
                      </ListItem>
                  ))}
              </RadioGroup>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                  <Button onClick={() => setPage(page - 1)} disabled={page === 0}>Previous</Button>
                  <Button onClick={() => setPage(page + 1)} disabled={(page + 1) * itemsPerPage >= filteredUsers.length}>Next</Button>
              </Box>
              <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleChangeOwner}
                  disabled={selectedUser === null}
                  sx={{ mt: 2, mb: 2 }}
              >
                  Give ownership and leave channel
              </Button>
          </>
      ) : (
          //Ownerではない or 自分が最後の1人である場合
          <Button 
              variant="contained" 
              color="primary" 
              onClick={handleLeaveChannel} 
              sx={{ mt: 2, mb: 2 }}
          >
              Leave Channel
          </Button>
      )}
      </Dialog>
		</>
	)
}

const Message = ({ message, myAccountUserId }) => {

  if (!getCookie("token")) {
		window.location.href = "/";
		return null;
	}

  const reqHeader = {
    headers: {
      Authorization: `Bearer ` + getCookie('token'),
      'Content-Type': 'application/json',
    },
  };

  // tokenデコード
  const decoded = decodeToken(getCookie("token"));
  console.log('decoded: ', decoded);
  const username = decoded.user.username;

  const [avatarPath, setAvatarPath] = useState("");
  const navigate = useNavigate();  // useNavigateを呼び出し

  const handleAvatarClick = () => {
    // Avatarがクリックされたときに/simpAccount/{username}に遷移
    navigate(`/simpleAccount/${message.username}`);
  };
  
  // 自分のメッセージかどうか
  const isMine = message.username === myAccountUserId;

  useEffect(() => {
    const fetchAvatarPath = async () => {
      const avatarURL = import.meta.env.VITE_API_BASE_URL + "users/" + message.username + "/avatar";
      // avatarのpathを非同期で取得するロジックを書く
      setAvatarPath(avatarURL);
      // alert(message.isInvitation);
    };

    fetchAvatarPath();
  }, [message.username]);

  const acceptInvitation = async (message) => {
    httpClient
      .post(`/message/accept/${username}`, { messageId: message.id }, reqHeader)
      .then((response) => {
        console.log(response);  // レスポンスをログ出力
        alert("招待を受けました");  // 成功メッセージを表示します
        navigate('/game');
      })
      .catch((error) => {
        console.log("An error occurred:", error);
        alert(error);
        alert("An error occurred while accepting the invitation");  // エラーメッセージを表示します
        return;
      });
  }

	return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: isMine ? "flex-end" : "flex-start",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMine ? "row" : "row-reverse",
            alignItems: "center",
          }}
        >
          <Tooltip title={message.username}>
            <Avatar src={avatarPath} onClick={handleAvatarClick} />
          </Tooltip>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              ml: isMine ? 1 : 0,
              mr: isMine ? 0 : 1,
              backgroundColor: isMine ? "primary.light" : "secondary.light",
              borderRadius: isMine ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
            {message.isInvitation && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column", // 縦長に配置
                  alignItems: "center",
                  mt: 2, // テキストとの間隔を調整
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  disabled={message.isAccepted || isMine}
                  onClick={() => acceptInvitation(message)}
                >
                  accept invitation
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
}

export default ChatRoom