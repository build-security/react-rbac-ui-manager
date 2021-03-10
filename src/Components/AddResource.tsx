import React from "react";
import styled from "styled-components";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";

const AddResource = () => {
    return (
        <>
            <AddResourceIcon /> Add Resource
        </>
    );
};

export default AddResource;

const AddResourceIcon = styled(AddCircleOutlineIcon)`
    vertical-align: -6px;
`;
