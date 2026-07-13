---
title: Excel批量生成Word工具：用Python实现办公自动化
pubDatetime: 2026-07-13T22:00:00+08:00
description: 详解一个基于Python的桌面小工具，通过Excel数据与Word模板自动生成Word文档，支持合并导出与多文件独立输出两种模式，并附带完整源码与实现细节。
category: 开发
tags:
- Python
- 办公自动化
- tkinter
- python-docx
- Word
- docx
- Office
- 批量生成
---

在日常办公中，我们经常需要根据一份数据表格批量生成大量格式相同、内容不同的 Word 文档，比如合同、证书、通知函等。手动复制粘贴不仅耗时，还容易出错。本文介绍一个用 Python 编写的桌面工具，它可以读取 Excel 中的多行数据，结合 Word 模板中的占位符，自动生成最终文档。程序支持两种输出模式：**合并为一个 Word 文件**（每份文档之间可选分页符）或**生成多个独立 Word 文件**，并以文件名列作为文件命名依据。

## 1. 工具概览

这个工具使用 Python 自带的 `tkinter` 构建图形界面，用 `openpyxl` 读取 `.xlsx` 数据，用 `python-docx` 和 `docxcompose` 处理 Word 文档。核心流程如下：

1. 选择 Excel 数据文件（第一列为文件名列，仅在多文件模式下使用；从第二列开始为占位符列）。
2. 选择 Word 模板文件（模板中用 `{{占位符}}` 的形式标记需要替换的内容）。
3. 选择输出模式：
   - **合并为单个Word文件**：所有数据行生成的文档按顺序拼接成一个文件，并可选择在每份文档之间插入分页符。
   - **生成多个独立Word文件**：每一行数据生成一个单独的 `.docx` 文件，文件名为 Excel 第一列的内容（自动清理非法字符）。
4. 点击“开始生成”，程序将在后台线程中完成替换与保存，期间界面不会卡死，并实时输出运行日志。

## 2. 技术实现细节

### 2.1 占位符替换逻辑

Word 模板中的占位符一般位于段落或表格单元格中。程序定义了两个关键函数：

- `replace_text_in_paragraph(para, replace_dict)`：仅当段落文本中**存在**任意占位符时才执行替换，避免破坏分页符、特殊格式等非文本元素。替换时，先将所有 `run` 的文本拼接成一个完整字符串，完成全部替换后，把新文本赋给第一个 `run`，其余 `run` 的文本清空，从而保持段落基本样式不变。
- `replace_text_in_doc(doc, replace_dict)`：遍历文档中的段落和所有表格单元格中的段落，调用上面的函数完成全文替换。

这种“一次性全文替换”的方式比逐个 `run` 替换更高效，也能避免占位符跨多个 `run` 时无法匹配的问题。

### 2.2 两种输出模式的设计

- **合并模式（merge）**：按行循环生成 `Document` 对象，若开启分页符且不是最后一份文档，则在文档末尾添加一个分页符（`WD_BREAK.PAGE`），最后利用 `docxcompose` 的 `Composer` 将所有文档拼接并保存为一个文件。
- **多文件模式（multi）**：同样按行生成 `Document` 对象，但以 Excel 第一列的文本作为文件名（经过 `sanitize_filename` 清理非法字符），直接 `doc.save()` 保存到用户选择的目录。

这种模式分离使用户能够根据实际需求灵活选择输出形式。

### 2.3 线程与界面交互

生成任务放在 `threading.Thread` 中运行，避免长时间任务阻塞 GUI。日志输出通过 `root.after(0, ...)` 调度回主线程更新 `ScrolledText` 组件，保证线程安全。

### 2.4 文件名安全处理

Windows 文件名不能包含 `\ / : * ? " < > |` 等字符，`sanitize_filename` 函数将这些字符替换为下划线，并去除首尾空格，确保文件保存成功。

## 3. 使用方法

1. **准备 Excel 数据文件**  
   第一行是表头，从第二列开始为占位符名称（例如 `姓名`、`金额`、`日期` 等）。第一列仅在“生成多个独立文件”模式下用作文件名，合并模式下可留空或忽略。  
   示例：

   | 文件名 | 姓名 | 金额 | 日期 |
   |--------|------|------|------|
   | 张三合同 | 张三 | 5000 | 2026-07-01 |
   | 李四合同 | 李四 | 8000 | 2026-07-02 |

2. **准备 Word 模板**  
   在模板中需要动态插入内容的位置写上对应的占位符，例如 `{{姓名}}`、`{{金额}}`。占位符应与 Excel 表头完全一致。

3. **运行程序**  
   启动后依次选择 Excel 和 Word 模板文件，根据需要选择输出模式，并指定保存位置，点击“开始生成”即可。

4. **查看日志**  
   程序下方的日志区域会实时显示处理进度、跳过的空行以及最终生成结果。

## 4. 完整代码

以下是该工具的完整 Python 源代码，可直接保存为 `.py` 文件运行。运行前请确保已安装所需依赖：

```bash
pip install openpyxl python-docx docxcompose
```

```python
import os
import threading
import tkinter as tk
from tkinter import filedialog, scrolledtext
from openpyxl import load_workbook
from docx import Document
from docx.enum.text import WD_BREAK
from docxcompose.composer import Composer


def sanitize_filename(filename):
    """清理文件名中的非法字符，避免保存失败"""
    illegal_chars = '\\/:*?"<>|'
    for c in illegal_chars:
        filename = filename.replace(c, '_')
    return filename.strip()


def replace_text_in_paragraph(para, replace_dict):
    """仅当段落包含占位符时才执行替换，避免误删分页符、特殊格式等非文本元素"""
    full_text = ''.join(run.text for run in para.runs)

    has_placeholder = any(key in full_text for key in replace_dict.keys())
    if not has_placeholder:
        return

    for old_str, new_str in replace_dict.items():
        full_text = full_text.replace(old_str, new_str)

    if para.runs:
        para.runs[0].text = full_text
        for run in para.runs[1:]:
            run.text = ''


def replace_text_in_doc(doc, replace_dict):
    """全文档替换：覆盖正文段落 + 所有表格单元格"""
    for para in doc.paragraphs:
        replace_text_in_paragraph(para, replace_dict)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for para in cell.paragraphs:
                    replace_text_in_paragraph(para, replace_dict)


class DocxMergeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Excel批量生成Word工具")
        self.root.geometry("650x500")
        self.root.minsize(580, 450)

        self.excel_path = tk.StringVar()
        self.template_path = tk.StringVar()
        self.page_break_var = tk.BooleanVar(value=True)
        self.mode_var = tk.StringVar(value="merge")  # merge=合并单文件, multi=多文件独立输出
        self._build_ui()

    def _build_ui(self):
        container = tk.Frame(self.root, padx=12, pady=12)
        container.pack(fill=tk.BOTH, expand=True)

        # Excel文件选择
        tk.Label(container, text="Excel数据文件 (.xlsx):").grid(row=0, column=0, sticky="w", pady=6)
        tk.Entry(container, textvariable=self.excel_path).grid(row=0, column=1, padx=6, pady=6, sticky="we")
        tk.Button(container, text="浏览", command=self.browse_excel, width=8).grid(row=0, column=2, pady=6)

        # Word模板选择
        tk.Label(container, text="Word模板文件 (.docx):").grid(row=1, column=0, sticky="w", pady=6)
        tk.Entry(container, textvariable=self.template_path).grid(row=1, column=1, padx=6, pady=6, sticky="we")
        tk.Button(container, text="浏览", command=self.browse_template, width=8).grid(row=1, column=2, pady=6)

        # 输出模式选择
        tk.Label(container, text="输出模式:").grid(row=2, column=0, sticky="w", pady=6)
        mode_frame = tk.Frame(container)
        mode_frame.grid(row=2, column=1, columnspan=2, sticky="w", padx=6)
        tk.Radiobutton(
            mode_frame, text="合并为单个Word文件",
            variable=self.mode_var, value="merge",
            command=self._on_mode_change
        ).pack(side=tk.LEFT, padx=(0, 20))
        tk.Radiobutton(
            mode_frame, text="生成多个独立Word文件",
            variable=self.mode_var, value="multi",
            command=self._on_mode_change
        ).pack(side=tk.LEFT)

        # 分页符选项（仅合并模式可用）
        self.page_break_check = tk.Checkbutton(
            container,
            text="每份文档之间插入分页符",
            variable=self.page_break_var
        )
        self.page_break_check.grid(row=3, column=0, columnspan=3, sticky="w", pady=4)

        # 生成按钮
        self.generate_btn = tk.Button(
            container, text="开始生成",
            command=self.start_generate, height=2
        )
        self.generate_btn.grid(row=4, column=0, columnspan=3, pady=12, sticky="we")

        # 日志区域
        tk.Label(container, text="运行日志:").grid(row=5, column=0, sticky="w", pady=(0, 4))
        self.log_box = scrolledtext.ScrolledText(container, height=14, state="disabled", wrap=tk.WORD)
        self.log_box.grid(row=6, column=0, columnspan=3, sticky="nsew")

        # 自适应布局
        container.grid_columnconfigure(1, weight=1)
        container.grid_rowconfigure(6, weight=1)

    def _on_mode_change(self):
        """切换输出模式时更新控件状态"""
        if self.mode_var.get() == "merge":
            self.page_break_check.config(state="normal")
        else:
            self.page_break_check.config(state="disabled")

    def log(self, msg):
        def _write():
            self.log_box.config(state="normal")
            self.log_box.insert(tk.END, msg + "\n")
            self.log_box.see(tk.END)
            self.log_box.config(state="disabled")
        self.root.after(0, _write)

    def browse_excel(self):
        path = filedialog.askopenfilename(
            title="选择Excel数据文件",
            filetypes=[("Excel 文件", "*.xlsx")],
            initialdir=os.getcwd()
        )
        if path:
            self.excel_path.set(path)

    def browse_template(self):
        path = filedialog.askopenfilename(
            title="选择Word模板文件",
            filetypes=[("Word 文档", "*.docx")],
            initialdir=os.getcwd()
        )
        if path:
            self.template_path.set(path)

    def start_generate(self):
        excel = self.excel_path.get().strip()
        template = self.template_path.get().strip()
        mode = self.mode_var.get()

        if not excel or not os.path.isfile(excel):
            self.log("请选择有效的Excel文件")
            return
        if not template or not os.path.isfile(template):
            self.log("请选择有效的Word模板文件")
            return

        # 根据模式弹出对应保存对话框
        if mode == "merge":
            # 修正：使用Word模板文件名作为默认文件名前缀
            base_name = os.path.splitext(os.path.basename(template))[0]
            save_path = filedialog.asksaveasfilename(
                defaultextension=".docx",
                filetypes=[("Word 文档", "*.docx")],
                initialdir=os.path.dirname(excel),
                initialfile=f"{base_name}_结果文件.docx",
                title="保存合并后的Word文件"
            )
            if not save_path:
                self.log("○ 用户取消保存")
                return
        else:
            save_path = filedialog.askdirectory(
                title="选择多个Word文件的保存目录",
                initialdir=os.path.dirname(excel)
            )
            if not save_path:
                self.log("○ 用户取消选择目录")
                return

        self.generate_btn.config(state="disabled", text="生成中，请稍候...")
        threading.Thread(
            target=self._run_task,
            args=(excel, template, save_path, mode),
            daemon=True
        ).start()

    def _run_task(self, excel_path, template_path, save_path, mode):
        try:
            self.log("▶ 开始读取Excel文件")
            wb = load_workbook(excel_path, data_only=True)
            ws = wb.worksheets[0]
            rows = list(ws.iter_rows(values_only=True))
            wb.close()

            if len(rows) < 2:
                self.log("✖ 错误：Excel至少需要2行（第1行表头 + 第2行起数据）")
                return

            # 统一规则：第1列仅多文件模式用作文件名，占位符从第2列开始
            raw_headers = rows[0]
            headers = []
            col_indexes = []
            for idx in range(1, len(raw_headers)):
                h = raw_headers[idx]
                if h is not None and str(h).strip():
                    headers.append(str(h).strip())
                    col_indexes.append(idx)

            if not headers:
                self.log("✖ 错误：未检测到有效表头占位符（从第2列开始）")
                return
            self.log(f"✔ 检测到 {len(headers)} 个占位符，{len(rows)-1} 行待处理数据")

            # 收集有效数据行
            valid_rows = []
            for row_num, row in enumerate(rows[1:], start=2):
                if all(c is None or str(c).strip() == "" for c in row):
                    self.log(f"○ 跳过第 {row_num} 行空数据")
                    continue
                # 多文件模式下跳过文件名为空的行
                if mode == "multi":
                    filename = str(row[0]).strip() if row[0] is not None else ""
                    if not filename:
                        self.log(f"○ 跳过第 {row_num} 行：文件名为空")
                        continue
                valid_rows.append(row)

            if not valid_rows:
                self.log("✖ 错误：没有有效数据行可生成")
                return

            # 分模式处理
            if mode == "merge":
                self._handle_merge_mode(valid_rows, headers, col_indexes, template_path, save_path)
            else:
                self._handle_multi_mode(valid_rows, headers, col_indexes, template_path, save_path)

        except Exception as e:
            self.log(f"✖ 运行出错：{str(e)}")
        finally:
            self.root.after(
                0,
                lambda: self.generate_btn.config(state="normal", text="开始生成")
            )

    def _handle_merge_mode(self, valid_rows, headers, col_indexes, template_path, save_path):
        """合并单文件模式逻辑"""
        page_break = self.page_break_var.get()
        doc_list = []
        total = len(valid_rows)

        for i, row in enumerate(valid_rows):
            doc = Document(template_path)
            replace_dict = {}
            for h_idx, col_idx in enumerate(col_indexes):
                val = row[col_idx] if col_idx < len(row) else ""
                replace_dict[headers[h_idx]] = "" if val is None else str(val)

            replace_text_in_doc(doc, replace_dict)

            # 开启分页且不是最后一份，插入分页符
            if page_break and i < total - 1:
                para = doc.add_paragraph()
                run = para.add_run()
                run.add_break(WD_BREAK.PAGE)

            doc_list.append(doc)

        self.log(f"▶ 正在合并 {total} 份文档...")
        self.log(f"  分页模式：{'开启（每份之间插入分页符）' if page_break else '关闭（连续拼接）'}")

        composer = Composer(doc_list[0])
        for doc in doc_list[1:]:
            composer.append(doc)

        composer.save(save_path)
        self.log(f"✔ 生成完成！合并文件已保存至：\n  {save_path}")

    def _handle_multi_mode(self, valid_rows, headers, col_indexes, template_path, save_dir):
        """多文件独立输出模式逻辑"""
        total = len(valid_rows)
        self.log(f"▶ 正在生成 {total} 个独立Word文件...")
        success_count = 0

        for row in valid_rows:
            filename_raw = str(row[0]).strip()
            filename = sanitize_filename(filename_raw) + ".docx"
            save_file = os.path.join(save_dir, filename)

            doc = Document(template_path)
            replace_dict = {}
            for h_idx, col_idx in enumerate(col_indexes):
                val = row[col_idx] if col_idx < len(row) else ""
                replace_dict[headers[h_idx]] = "" if val is None else str(val)

            replace_text_in_doc(doc, replace_dict)

            try:
                doc.save(save_file)
                success_count += 1
            except Exception as e:
                self.log(f"✖ 保存失败 {filename}：{str(e)}")

        self.log(f"✔ 生成完成！成功生成 {success_count} 个文件")
        self.log(f"  保存目录：\n  {save_dir}")


if __name__ == "__main__":
    root = tk.Tk()
    DocxMergeApp(root)
    root.mainloop()
```

## 5. 结语

这个工具虽然小巧，却覆盖了实际办公场景中的常见需求，并且代码结构清晰、易于扩展。你可以根据实际需要进一步添加功能，例如支持 `.xls` 格式、自定义占位符边界符（如 `${字段}$`）、生成 PDF 等。希望它能帮助你从重复枯燥的文档生成工作中解脱出来，把时间花在更有价值的事情上。