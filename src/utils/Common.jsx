// return the user data from the session storage
export const getUser = () => {
  const userStr = localStorage.getItem('id');
  if (userStr) return JSON.parse(userStr);
  else return null;
}

export const getUserName = () => {
  const userNameStr = localStorage.getItem('username');
  if (userNameStr) return userNameStr;
  else return null;
}

// return the token from the session storage
export const getToken = () => {
  return localStorage.getItem('token') || null;
}

export const getPerm =()=>{
  const userNameStr = localStorage.getItem('perm');
  if (userNameStr) return userNameStr;
  else return null;
}

export const getRole_permission =()=>{
  
  const userNameStr = localStorage.getItem('role_permission');
  if (userNameStr) return userNameStr;
  else return null;
}
export const getRole_id =()=>{

  const userNameStr = localStorage.getItem('roleid');
  if (userNameStr) return userNameStr;
  else return null;
}

// remove the token and user from the session storage
export const removeUserSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('id');
  localStorage.removeItem('username');
  localStorage.removeItem('userid');


}

// set the token and user from the session storage
export const setUserSession =       (token, id, username,userid,roleid,rolename,role_permission,perm)=> {
  localStorage.setItem('token', token);
  localStorage.setItem('id', JSON.stringify(id));
  localStorage.setItem('username', username);
  localStorage.setItem('userid', userid);

  localStorage.setItem('roleid',roleid);
  localStorage.setItem('rolename',rolename);

  localStorage.setItem('perm',perm);
  localStorage.setItem('role_permission', role_permission);



}