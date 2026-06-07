testcase-browser.html
sekarang hanya menampilkan data yang disimpan ke file tsv

saya perlu ada

- versioning, misal tanggal hari ini testing untuk ver2.3.0, data tersebut di simpan, lalu ketika naik version berikutnya, tidak menimpa data ver2.3.0, karna setiap perubahan versiion, kemungkinan akan ada perubahan pada data testcase nya
- menyimpan tanggal, ketika test dilakukan, kemungkinan 1 set testcase tidak akan beres di hari yang sama, jadi ada data updateAt nya
- reset all field, ini untuk mereset field actual, dev/stag/prod status, overall status dan notes, perubahan ini juga akan ddisimpan updateAt nya
- ketika ada updateAt, data lama tetap di simpan
