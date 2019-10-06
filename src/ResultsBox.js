import React, { useState, useEffect } from "react";
import styled from "styled-components";
import qs from "qs";
import pretty from "prettysize";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Confetti from "react-dom-confetti";
import { File, User, Activity, Clock } from "react-bytesize-icons";

const config = {
  angle: 90,
  spread: 45,
  startVelocity: 35,
  elementCount: 35,
  decay: 0.75,
};

const List = styled.ul`
  list-style: none;
  margin: 60px 0;
`;

const Item = styled.li`
  padding: 0;
  margin-bottom: 60px;
`;

const Title = styled.p`
  display: flex;
  align-items: center;

  a {
    text-decoration: none;

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`;

const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Meta = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.33);
  margin-top: 15px;
  margin-right: 15px;

  svg {
    margin-right: 6px;
  }
`;

const CopyButton = styled.button`
  border: 0;
  background: none;
  outline: none;
  color: inherit;
  margin-left: 15px;
  line-height: 1;
  padding: 5px 10px;
  white-space: nowrap;

  &:hover,
  &:focus {
    background: white;
    color: #212123;
  }
`;

function ResultItem({ magnetUri, title, size, peers, publishDate, tracker, token }) {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!copied) {
      return null;
    }

    setTimeout(() => {
      setCopied(false);
    }, 4000);
  }, [copied]);

  return (
    <Item>
      <Title>
        <a href={magnetUri} title={`Magnet uri: ${title}`}>
          {title}
        </a>
        {token && (
          <CopyButton
            copied={added}
            onClick={() => {
              if (added) {
                window.location = "https://app.put.io/transfers";
              } else {
                addTransfer(token, magnetUri).then(
                  response => response.status === 200 && setAdded(true)
                );
              }
            }}
          >
            <Confetti active={added} config={config} />
            {!added && <span>Add to put.io</span>}
            {added && <span>See transfer</span>}
          </CopyButton>
        )}
        {!token && (
          <CopyToClipboard text={magnetUri} onCopy={() => setCopied(true)}>
            <CopyButton copied={copied}>
              <Confetti active={copied} config={config} />
              {!copied && <span>Copy</span>}
              {copied && <span>Done</span>}
            </CopyButton>
          </CopyToClipboard>
        )}
      </Title>

      <Info>
        <Meta>
          <Activity width={16} height={16} /> {peers}
        </Meta>
        <Meta>
          <File width={16} height={16} /> {size}
        </Meta>
        <Meta>
          <Clock width={16} height={16} /> {publishDate}
        </Meta>
        <Meta>
          <User width={16} height={16} /> {tracker}
        </Meta>
      </Info>
    </Item>
  );
}

export function ResultsBox({ results, token }) {
  if (!results || results.length === 0) {
    return <Title>No results</Title>;
  }
  return (
    <List>
      {results.map(({ id, link, title, size, peers, source, upload_time }) => (
        <ResultItem
          key={id}
          magnetUri={link}
          title={title}
          size={pretty(size)}
          peers={peers}
          tracker={source}
          publishDate={new Date(upload_time).toLocaleDateString()}
          token={token}
        />
      ))}
    </List>
  );
}

function addTransfer(token, magnetLink) {
  const options = {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: qs.stringify({
      url: magnetLink,
      oauth_token: token,
    }),
  };

  return fetch(`https://api.put.io/v2/transfers/add`, options);
}
