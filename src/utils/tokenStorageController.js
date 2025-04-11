export function getToken(){
    return JSON.parse(localStorage.getItem('authToken'))
}

export function saveToken(token){
    localStorage.setItem('authToken', JSON.stringify(token));
}

export function delToken(){
    localStorage.removeItem('authToken');
}