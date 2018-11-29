import React, { useState, useEffect } from "react";
import styled, { css, createGlobalStyle, keyframes } from "styled-components";
import { SearchBox } from "./SearchBox";
import { ResultsBox } from "./ResultsBox";
import { GitHub, Info, Close } from "react-bytesize-icons";

const GlobalStyle = createGlobalStyle`
  * {
		padding: 0;
		margin: 0;
	}

	body {
		font-family: "Andale Mono", Consolas, monospaced;
		padding: 60px;
		max-width: 960px;
		margin: 0 auto;
		background-color: #212123;
		color: #ffffff;
		line-height: 1.6;
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
  width: 0;
  height: 0;
  position: relative;
  top: -16px;
  transform: ${props => (props.loading ? "rotate(-90deg)" : "rotate(0deg)")};
  transition: transform 400ms;
  transform-origin: left center;
  animation: ${props =>
    props.loading
      ? css`
          ${turn} 900ms infinite alternate-reverse
        `
      : "none"};
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

  &:hover {
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

export function App() {
  const [term, setTerm] = useState();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(
    () => {
      if (!term || term.length === 0) {
        return null;
      }

      setLoading(true);
      setResults([]);
      search(term).then(results => {
        setResults(results);
        setLoading(false);
      });
    },
    [term]
  );

  return (
    <React.Fragment>
      <Header>
        <Magno loading={loading}>🧲</Magno>
        <Links>
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
          <p>Magnet links search interface.</p>
          <p>
            Built with <a href="https://reactjs.org">React</a> and{" "}
            <a href="https://github.com/netlify/netlify-lambda">Netlify Lambdas</a>. Hosted on{" "}
            <a href="https://netlify.com">Netlify</a>.
          </p>
          <h4>Acknowledgements</h4>
          <p>
            Inspired by <a href="https://github.com/philhawksworth/puttr">Puttr</a> by{" "}
            <a href="https://twitter.com/philhawksworth" rel="nofollow">
              Phil Hawksowrth
            </a>
            . Lib forked from <a href="https://github.com/ItzBlitz98/torrentflix">torrentflix</a>
          </p>
          <p>
            Made by <a href="https://ped.ro">Pedro</a> 👊
          </p>
        </InfoBox>
      )}
      <SearchBox onSubmit={term => setTerm(term)} />
      <ResultsBox results={results} />
      <GlobalStyle />
    </React.Fragment>
  );
}

function search(term) {
  return fetch(`/.netlify/functions/magno?q=${term}`).then(response => response.json());
}
