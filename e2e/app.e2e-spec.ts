import { ThesceneNg2LibPage } from './app.po';

describe('thescene-ng2-lib App', () => {
  let page: ThesceneNg2LibPage;

  beforeEach(() => {
    page = new ThesceneNg2LibPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('demo works!');
  });
});
