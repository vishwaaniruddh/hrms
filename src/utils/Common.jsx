// return the user data from the session storage
export const getUser = () => {
  const userStr = sessionStorage.getItem('id');
  if (userStr) return JSON.parse(userStr);
  else return null;
}

export const getUserName = () => {
  const userNameStr = sessionStorage.getItem('username');
  if (userNameStr) return userNameStr;
  else return null;
}

// return the token from the session storage
export const getToken = () => {
  return sessionStorage.getItem('token') || null;
}

export const getPerm =()=>{
  const userNameStr = sessionStorage.getItem('perm');
  if (userNameStr) return userNameStr;
  else return null;
}

export const getRole_permission =()=>{
  
  const userNameStr = sessionStorage.getItem('role_permission');
  if (userNameStr) return userNameStr;
  else return null;
}
export const getRole_id =()=>{

  const userNameStr = sessionStorage.getItem('roleid');
  if (userNameStr) return userNameStr;
  else return null;
}

// remove the token and user from the session storage
export const removeUserSession = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('id');
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('userid');
  sessionStorage.removeItem('roleid');
  sessionStorage.removeItem('rolename');
  sessionStorage.removeItem('perm');
  sessionStorage.removeItem('role_permission');


}

// set the token and user from the session storage
export const setUserSession =       (token, id, username,userid,roleid,rolename,role_permission,perm)=> {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('id', JSON.stringify(id));
  sessionStorage.setItem('username', username);
  sessionStorage.setItem('userid', userid);

  sessionStorage.setItem('roleid',roleid);
  sessionStorage.setItem('rolename',rolename);

  sessionStorage.setItem('perm',perm);
  sessionStorage.setItem('role_permission', role_permission);



}