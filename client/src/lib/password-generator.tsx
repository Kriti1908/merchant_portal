export function generateStrongPassword(length = 16): string {
  // Define character sets
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // removed confusing characters
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // removed confusing characters
  const numberChars = '23456789'; // removed confusing numbers
  const specialChars = '#$%&*+?@!-_=';
  
  // Initial empty password
  let password = '';
  
  // Ensure at least one character from each group
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters from all groups
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to avoid predictable pattern
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}