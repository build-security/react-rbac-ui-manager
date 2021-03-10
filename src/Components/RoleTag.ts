import { withTheme } from "@material-ui/core";
import styled from "styled-components";

const RoleTag = withTheme(styled.span`
    text-transform: uppercase;
    color: ${(props: any) => props.theme.palette.primary.light};
    background: ${(props: any) => props.theme.palette.info.main};
    padding: 4px;
    white-space: nowrap;
`);

export default RoleTag;
