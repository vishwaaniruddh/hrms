import React from 'react';
import { removeUserSession } from './Common'
import swal from 'sweetalert';



function Logout(props) {
    console.log('sdsdsd')
    removeUserSession();    
    swal("Logout Succesfull", "", "success");
    props.history.push('/login');
    return (
        <></>
    )
}

export default Logout;