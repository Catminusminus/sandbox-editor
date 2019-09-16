import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

import { useSandboxEditor } from './SandboxHooks';

import { runJSTest } from './sandbox/javascript';

export type SandboxFiles = { [filename: string]: string };

const initialSources: { [p: string]: string } = {
  'index.test.js': `const { truth } = require('index.js')

describe('truth', () => {
  test('All number is 42', () => {
    expect(truth()).toBe(42)
  })
})
`,
  'index.js': `function truth() {
  return 8 * 6;
}

module.exports = {
  truth
}
`
};

const useSandboxFiles = () => {
  const [files, setFiles] = useState<SandboxFiles>(initialSources);
  const [filename, setFilename] = React.useState('index.test.js');

  return { files, setFiles, filename, setFilename };
};

const EditorDiv = styled.div`
  width: 50vw;
  height: 100vh;
`;

const SandboxDiv = styled.div`
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 50% 50%;
`;

export type EditorProps = {
  files: SandboxFiles;
  run: (name?: string) => void;
  filename: string;
  text: string;
  setText: (newText: string, newFilename?: string) => void;
};

const Sandbox: React.FC = () => {
  const { files, setFiles, filename, setFilename } = useSandboxFiles();
  const [stdout, setStdout] = React.useState('');

  const run = React.useCallback(
    (name: string = 'index.test.js') => {
      console.log('run');
      setStdout('');
      runJSTest(files, name, setStdout);
    },
    [files, setStdout]
  );

  const text = files[filename];
  const setText = useCallback(
    (newText: string, newFilename: string = filename) => {
      setFiles(x => ({
        ...x,
        [newFilename]: newText
      }));
    },
    [setFiles, filename]
  );

  const newFile = (newFilename: string) => {
    setText('', newFilename);
    setFilename(newFilename);
  };

  const { editorDiv } = useSandboxEditor({
    run,
    files,
    setText,
    filename,
    text
  });
  const [newFilename, setNewFilename] = React.useState('');

  const sourceList = Object.keys(files).map(name => ({
    name,
    size: files[name].length
  }));

  console.log('sources', files);
  return (
    <SandboxDiv>
      <EditorDiv style={{ gridColumn: '1/2' }} ref={editorDiv} />
      <div style={{ gridColumn: '2/2' }}>
        <button onClick={() => run()}>RUN</button>
        <form
          onSubmit={ev => {
            ev.preventDefault();
            newFile(newFilename);
          }}
        >
          <input
            type="text"
            value={newFilename}
            onChange={e => setNewFilename(e.target.value)}
          />
          <button type="submit">create new file</button>
        </form>
        <div>
          {sourceList.map(({ name, size }: any) => {
            const isCurrent = name === filename;
            const style = isCurrent ? { background: '#aacccc' } : {};
            return (
              <div
                onClick={() => setFilename(name)}
                key={name}
                style={style}
              >
                {name}: {size} bytes
              </div>
            );
          })}
        </div>
        <code>
          <pre>{stdout}</pre>
        </code>
      </div>
    </SandboxDiv>
  );
};

export default Sandbox;
