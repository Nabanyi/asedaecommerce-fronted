import {TopBar} from './TopBar';
import {MainContent} from './MainContent';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

const Layout = ({ children, currentPage }: Props & { currentPage: string }) => {
  return (
    <div className="main-wrapper">
      <TopBar currentPage={currentPage}/>
      <MainContent>{children}</MainContent>
    </div>
  );
};

export default Layout;