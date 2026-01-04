function validateAccount(account) {
  const errors = [];

  if (!account.name || account.name.trim() === '') {
    errors.push('Nama akun harus diisi');
  }

  if (!account.instagram.enabled && !account.tiktok.enabled) {
    errors.push('Minimal satu platform harus diaktifkan');
  }

  if (account.instagram.enabled) {
    if (!account.instagram.username) {
      errors.push('Username Instagram harus diisi');
    }
    if (!account.instagram.password) {
      errors.push('Password Instagram harus diisi');
    }
  }

  if (account.tiktok.enabled) {
    if (!account.tiktok.username) {
      errors.push('Username TikTok harus diisi');
    }
    if (!account.tiktok.password) {
      errors.push('Password TikTok harus diisi');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validatePost(post) {
  const errors = [];

  if (!post.caption || post.caption.trim() === '') {
    errors.push('Caption harus diisi');
  }

  if (!post.media) {
    errors.push('File media harus diupload');
  }

  if (!post.accounts || post.accounts.length === 0) {
    errors.push('Minimal satu akun harus dipilih');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateAccount,
  validatePost
};