// Cookie取得
export const getCookie = (name) => {
	const cookieString = document.cookie;
	const cookies = cookieString.split(';');
	for (let i = 0; i < cookies.length; i++) {
	  const cookie = cookies[i].trim();
	  if (cookie.startsWith(name + '=')) {
		return cookie.substring(name.length + 1);
	  }
	}
	return null;
};

// Cookie更新
export const updateCookie = (name, value) => {
	const cookies = document.cookie.split(';');
	let updatedCookies = cookies.map(cookie => {
	  const [cookieName, cookieValue] = cookie.trim().split('=');
	  if (cookieName === name) {
		return `${cookieName}=${encodeURIComponent(value)}`;
	  }
	  return cookie;
	});
	document.cookie = updatedCookies.join(';');
};