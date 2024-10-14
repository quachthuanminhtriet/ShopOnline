import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Phần thông tin liên hệ hoặc tác giả */}
        <div style={styles.leftSection}>
          <p style={styles.text}>© 2024 Quách Thuần Minh Triết. All Rights Reserved.</p>
          <p style={styles.text}>Vị trí: TPHCM</p>
        </div>

        <div style={styles.centerSection}>
          <p style={styles.text}>Ngân hàng liên kết:</p>
          <div style={styles.logos}>
            <img src="https://tinhocnews.com/wp-content/uploads/2024/06/msb-logo-vector-20.jpg" alt="MSB" style={styles.logo} />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCp0JctwLH5Hgagb0TY-xvAuWK2NCGU4fZgQ&s" alt="Momo" style={styles.logo} />
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/02/Icon-MB-Bank-MBB.png" alt="MB" style={styles.logo} />
          </div>
        </div>

        <div style={styles.rightSection}>
          <p style={styles.text}>Liên kết hữu ích:</p>
          <ul style={styles.linkList}>
            <li><Link to='/' style={styles.link}>Trang chủ</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '20px 50px',
    width: '100%',
    fontSize: '14px',
    bottom: '0',
    left: '0',
    textAlign: 'center',
    clear: 'both',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leftSection: {
    textAlign: 'left',
    flex: 1,
  },
  centerSection: {
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    textAlign: 'right',
    flex: 1,
  },
  text: {
    margin: 0,
  },
  logos: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  },
  logo: {
    height: '40px',
    margin: '0 10px',
  },
  linkList: {
    listStyleType: 'none',
    padding: 0,
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    marginBottom: '5px',
  }
};


export default Footer;
