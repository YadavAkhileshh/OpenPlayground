import React from 'react';
import SnippetList from '../components/SnippetList';
import API_URL from '../api';

const Vault = () => {
    return <SnippetList title="Vault" fetchUrl={`${API_URL}/snippets`} />;
};

export default Vault;
