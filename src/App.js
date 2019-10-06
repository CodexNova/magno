import React, { useState, useEffect } from "react";
import styled, { css, createGlobalStyle, keyframes } from "styled-components";
import ReactGA from "react-ga";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { Magnet } from "./Magnet";
import { SearchBox } from "./SearchBox";
import { ResultsBox } from "./ResultsBox";
import { GitHub, Info, Close } from "react-bytesize-icons";

const { NODE_ENV, REACT_APP_PUTIO_CLIENT_ID } = process.env;

const PUTIO_URL = `https://api.put.io/v2/oauth2/authenticate?client_id=${REACT_APP_PUTIO_CLIENT_ID}&response_type=token&redirect_uri=${window.location.origin}`;

const GlobalStyle = createGlobalStyle`
  * {
		padding: 0;
		margin: 0;
	}

	body {
		font-family: "Andale Mono", Consolas, "Courier New", monospaced;
		max-width: 840px;
		margin: 0 auto;
		padding: 30px;
		background-color: #212123;
		color: #ffffff;
		line-height: 1.6;

		@media(min-width: 40em) {
			padding: 60px;
		}
	}


	input, button {
		font-family: inherit;
		color: inherit;
	}

	a {
		color: inherit;
	}

	::selection {
		background-color: black;
		color: white;
	}
`;

const turn = keyframes`
	0% {
		transform: rotate(-90deg);
	}

	25% {
		transform: rotate(-30deg);
	}

	50% {
		transform: rotate(-60deg);
	}

	75% {
		transform: rotate(-20deg);
	}

	100% {
		transform: rotate(-10deg);
	}
`;

const Header = styled.header`
  font-size: 16px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Magno = styled.span`
  display: inline-block;
  width: 45px;
  height: 45px;
  transform: ${props => (props.loading ? "rotate(-90deg)" : "rotate(0deg)")};
  transition: transform 400ms;
  transform-origin: center center;
  animation: ${props =>
    props.loading
      ? css`
          ${turn} 900ms infinite alternate-reverse
        `
      : "none"};

  svg {
    width: 100%;
  }
`;

const Links = styled.nav`
  display: flex;
  align-items: center;
`;

const Link = styled.a`
  margin: 0;
  background: transparent;
  border: 0;
  outline: none;
  color: rgba(255, 255, 255, 0.33);
  transition: color 100ms;
  padding: 5px 7px;
  line-height: 1;

  &:hover,
  &:focus {
    color: #ffffff;
  }
`;

const show = keyframes`
	0% { opacity: 0; transform: translateY(-6px)}
	100% { opacity: 1; transform: translateY(0)}
`;

const InfoBox = styled.div`
  margin: 30px 0;
  animation: ${show} 333ms both;

  p {
    margin: 15px 0;
  }

  h4 {
    margin-top: 30px;
  }
`;

const putioToken = window.location.hash.split("#access_token=")[1];

if (putioToken) {
  window.history.pushState("", "", "/");
}

export function App() {
  const [term, setTerm] = useState();
  const [results, setResults] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [token, setToken] = useLocalStorage("token", putioToken);

  useEffect(() => {
    if (NODE_ENV === "production") {
      ReactGA.initialize("UA-28314827-6");
    }

    // HACK: Using `account/info` to check if token is valid
    // there must be a better way to do this...
    fetch(`https://api.put.io/v2/account/info?oauth_token=${token}`).then(res => {
      if (res.status === 401) {
        setToken(undefined);
      }
    });
  }, []);

  useEffect(() => {
    if (!term || term.length === 0) {
      return null;
    }

    setLoading(true);
    setResults(undefined);

    search(term)
      .then(results => {
        console.log("Results received");
        console.log(results);
        setResults(results);
        setLoading(false);

        if (NODE_ENV === "production") {
          ReactGA.event({
            category: "User",
            action: "Search",
            label: term,
          });
        }
      })
      .catch(error => console.log(error));
  }, [term]);

  return (
    <React.Fragment>
      <Header>
        <Magno loading={loading}>
          <Magnet />
        </Magno>
        <Links>
          {!token && <Link href={PUTIO_URL}>Sign in with put.io</Link>}
          <Link href="https://github.com/peduarte/magno">
            <GitHub width="16" height="16" />
          </Link>
          {!showInfo && (
            <Link as="button" onClick={() => setShowInfo(true)}>
              <Info width="16" height="16" />
            </Link>
          )}
          {showInfo && (
            <Link as="button" onClick={() => setShowInfo(false)}>
              <Close width="16" height="16" />
            </Link>
          )}
        </Links>
      </Header>
      {showInfo && (
        <InfoBox>
          <p>Magnet links search interface</p>
          <p>
            Built with <a href="https://reactjs.org">React</a> and{" "}
            <a href="https://github.com/netlify/netlify-lambda">Netlify Lambdas</a>. Hosted on{" "}
            <a href="https://netlify.com">Netlify</a>
          </p>
          <h4>Acknowledgements</h4>
          <p>
            Inspired by <a href="https://github.com/philhawksworth/puttr">Puttr</a> by{" "}
            <a href="https://twitter.com/philhawksworth" rel="nofollow">
              Phil Hawksowrth
            </a>
            . Magnet icon by{" "}
            <a href="https://thenounproject.com/search/?q=magnet&amp;i=33272">Matt Brooks</a>
          </p>
          <p>
            Made by <a href="https://ped.ro">Pedro</a> 👊
          </p>
        </InfoBox>
      )}
      <SearchBox onSubmit={term => setTerm(term)} />
      {results && <ResultsBox results={results} token={token} />}
      <GlobalStyle />
    </React.Fragment>
  );
}

function search(term) {
  const url = `/.netlify/functions/api?keyword=${term}`;

  return fetch(url)
    .then(response => response.json())
    .catch(error => console.log("error"));
}
