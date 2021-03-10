import React from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import styled from "styled-components";

const AddRole = () => {
    return (
        <>
            Add Role <AddRoleIcon fontSize='small' />
        </>
    );
};

export default AddRole;

const AddRoleIcon = styled(AddCircleOutlineIcon)`
    vertical-align: -4px;
`;
