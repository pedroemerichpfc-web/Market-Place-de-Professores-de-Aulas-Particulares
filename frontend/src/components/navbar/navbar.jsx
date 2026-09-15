import styles from './navbar.module.css'
import { LuCalendar, LuCircleUser, LuMenu } from "react-icons/lu";
import { Drawer } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [openMenu, setOpenMenu] = useState(false);

    const handleOpenMenu = () => {
        setOpenMenu(!openMenu);
    }

    return (
        <nav className={styles.navbarContainer}>
            <div className={styles.navbarItems}>
                <Link to="/">
                    <img className={styles.logo} src="/logo.png" alt="" />
                </Link>
                <div className={styles.navbarLinksContainer}>

                    <Link to="/" className={styles.navbarLink}>Home</Link>
                    <Link to="/materials" className={styles.navbarLink}>Materias</Link>
                    <Link to="/appointments">
                        <LuCalendar className={styles.navbarLink} />
                    </Link>
                    <Link to="/profile">
                        <LuCircleUser className={styles.navbarLink} />
                    </Link>
                </div>
            </div>
            <div className={styles.mobileNavbarItems}>
                <img className={styles.logo} src="/logo.png" alt="" />
                <div className={styles.mobileNavbarBtns}>
                    <LuCalendar className={styles.navbarLink} />
                    <LuMenu className={styles.navbarLink} onClick={handleOpenMenu} />
                </div>
            </div>
            <Drawer
                anchor='right'
                open={openMenu}
                onClose={handleOpenMenu}
            >
                <div className={styles.drawer}>
                    <a href="" className={styles.navbarLink}>Home</a>
                    <a href="" className={styles.navbarLink}>Materias</a>
                    <a href="" className={styles.navbarLink}>Profile</a>
                </div>

            </Drawer>

        </nav>
    )
}