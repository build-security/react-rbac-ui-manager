import React from "react";
import styled from "styled-components";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prism-themes/themes/prism-atom-dark.css";

const JSONViewer = ({ data }: any) => {
    return (
        <StyledEditor
            value={JSON.stringify(data, null, 4)}
            highlight={(code: any) =>
                Prism.highlight(code || "", Prism.languages.json, "json")
            }
            padding={5}
            onValueChange={val => {
                // do nothing
            }}
        />
    );
};

export default JSONViewer;

const StyledEditor = styled(Editor)`
    background: black;
    font-family: "Fira code", "Fira Mono", monospace;
    font-size: 14px;
    min-height: 100px;

    & :focus {
        outline: none;
    }
`;
