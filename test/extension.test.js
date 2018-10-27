//TODO Improve tests to validate header content instead of simply it's presence

const {
  assert
} = require("chai");

const {
  Extension
} = require("../extension");

const ext = new Extension();

const {
  workspace,
  Position,
  WorkspaceEdit,
  Range,
  extensions
} = require("vscode");

const path = require("path");

suite("Extension Tests", function () {
  test("Testing PreSaveListener - Positive", async () => {
    await loadExtension();

    const document = await openTestDocumentByLanguageId('apex');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");

    return;
  });

  test("Testing PreSaveListener - Negative", async () => {
    await loadExtension();

    const document = await openTestDocumentByLanguageId('js');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.strictEqual(document.getText(), "");

    return;
  })

  test("Testing getInsertFileHeaderEdit", async () => {
    const document = await openTestDocumentByLanguageId('apex');

    const insertFileHeaderEdit =
      await ext.getInsertFileHeaderEdit(document);

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");

    return;
  })

  test("Testing isLineABlockComment", done => {
    const blockCommentString =
      `/* 
    * Block Comment 
    */`;
    const singleCommentString = '// Single Comment';
    const notACommentString = 'HugoOM';

    assert.isTrue(ext.isLineABlockComment(blockCommentString));
    assert.isFalse(ext.isLineABlockComment(singleCommentString));
    assert.isFalse(ext.isLineABlockComment(notACommentString));

    done();
  })

  test("Testing isLanguageSFDC", done => {
    const sfdcLanguageId = 'apex';
    const nonSFDXLanguageId = 'JavaScript';

    assert.isTrue(ext.isLanguageSFDC(sfdcLanguageId));
    assert.isFalse(ext.isLanguageSFDC(nonSFDXLanguageId));

    done();
  })

  test("Testing getHeaderFormattedDateTime", done => {
    const headerFormattedDate = ext.getHeaderFormattedDateTime();

    assert.typeOf(headerFormattedDate, "string");

    done();
  })

  test("Testing getConfiguredUsername", async () => {
    const settingsUsername = await workspace.getConfiguration("SFDX_Autoheader");

    await settingsUsername.update("username", '', true);

    assert.strictEqual(
      ext.getConfiguredUsername(),
      settingsUsername.inspect("username").defaultValue
    );

    const testUsername = 'HugoOM@github.com';

    await settingsUsername.update("username", testUsername, true);

    assert.strictEqual(
      ext.getConfiguredUsername(),
      testUsername
    );

    return;
  })
});

function openTestDocumentByLanguageId(languageId) {
  return workspace.openTextDocument(
    path.join(
      __dirname,
      "test_files",
      `testFile_SFDXAutoheader.${languageId}`
    )
  );
}

function loadExtension() {
  const testExt = extensions.getExtension("HugoOM.sfdx-autoheader");
  return testExt.activate();
}

async function clearFile(document) {
  const edit = new WorkspaceEdit();

  edit.delete(
    document.uri,
    new Range(
      new Position(0, 0),
      new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    )
  );

  edit.set(edit);

  return workspace.applyEdit(edit);
}