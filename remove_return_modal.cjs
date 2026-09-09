const fs = require('fs');
let content = fs.readFileSync('src/components/ReceptionCounterView.tsx', 'utf-8');

// I need to remove the return modal which is from 
// {/* ========================================================================= */}
// {/* MODAL: DEVOLUÇÃO PARCIAL / TOTAL NO BALCÃO                                 */}
// {/* ========================================================================= */}

const startStr = "{/* MODAL: DEVOLUÇÃO PARCIAL / TOTAL NO BALCÃO";
const startIndex = content.lastIndexOf("{/* ========================================================================= */", content.indexOf(startStr));
if (startIndex !== -1) {
  // Find the end of this block which should be the closing parenthesis and brace of the JSX block
  // The block ends around line 1630.
  // It ends with:
  //           </div>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  
  const endStr = "      )}";
  const endIndexOfBlock = content.indexOf(endStr, startIndex) + endStr.length;
  
  if (endIndexOfBlock > startIndex) {
    const nextChars = content.substring(endIndexOfBlock, endIndexOfBlock + 20);
    // Find the next `\n    </div>` and remove the modal only
    content = content.substring(0, startIndex) + content.substring(endIndexOfBlock);
  }
}

fs.writeFileSync('src/components/ReceptionCounterView.tsx', content);
