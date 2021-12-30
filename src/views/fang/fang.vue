<template>
    <d2-container>
        <!-- 顶部插槽 -->
        <div slot="header" style="display:flex">
          <el-input v-model="name" placeholder="房产名称" style="width:200px" />
          <el-button @click="getList" style="margin-left:30px">查询</el-button>
          <el-button @click="showDia" style="margin-left:30px">新增</el-button>
        </div>
          <!-- 底插槽 -->
        <div slot="footer">
            <el-pagination
                background
                layout="prev, pager, next"
                :page-size="limit"
                :total="total"
                @current-change="handlePageChange"
             />

        </div>

        <!--表格-->
        <el-table :data="tabelData">
             <el-table-column   prop="buildId" label="id" width="180" />
             <el-table-column   prop="name" label="名称"  />
             <el-table-column   prop="address" label="地址"  />
             <el-table-column   prop="streetNum" label="门牌"  />
            <el-table-column label="操作">
                <template slot-scope="scope">

                  <el-popover
                    placement="top"
                    width="200"
                    trigger="click"
                  >
                      <div>
                           您是否确认删除该信息
                           <el-button size="mini" @click="doDel(scope.row)">确认</el-button>
                      </div>
                    <el-button slot="reference" size="small">删除</el-button>
                  </el-popover>

                  <el-button size="small" @click="showEdDialog(scope.row)">编辑</el-button>
                </template>
            </el-table-column>

        </el-table>

        <!-- 添加房产 -->
        <el-dialog
          title="新增"
          :visible.sync="dialogVisible"
          width="600px"
          :before-close="handleClose"
          >
            <div>

              <el-form ref="form" :rules="rules" :model="form" label-width="80px">
                  <el-form-item label="房产名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                  </el-form-item>
                  <el-form-item label="地址" prop="address">
                        <el-select
                          v-model="form.address"
                          filterable
                          remote
                          reserve-keyword
                          placeholder="请输入关键词"
                          :remote-method="remoteMethod"
                          :loading="loading">
                          <el-option
                            v-for="item in options"
                            :key="item.label"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                  </el-form-item>
                  <el-form-item label="上传图片">
                      <el-upload
                        :file-list="fileList"
                        :action="actionUrl"
                        list-type="picture-card"
                        :on-preview="preView"
                        :on-success="uploadok"
                        :on-remove="remove">
                        <i class="el-icon-plus"></i>
                      </el-upload>
                  </el-form-item>
                </el-form>

            </div>

          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmit">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 编辑 -->
         <el-dialog
          title="编辑"
          :visible.sync="ediDialog"
           width="600px"
          :before-close="handleClose"
          >
            <div>

              <el-form ref="editform" :rules="rules" :model="editform" label-width="80px">
                  <el-form-item label="房产名称" prop="name">
                    <el-input v-model="editform.name"></el-input>
                  </el-form-item>
                  <el-form-item label="地址" prop="address">
                        <el-select
                          v-model="editform.address"
                          filterable
                          remote
                          placeholder="请输入关键词"
                          :remote-method="remoteMethod"
                          :loading="loading">
                          <el-option
                            v-for="item in options"
                            :key="item.label"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                  </el-form-item>
                  <el-form-item label="上传图片">
                      <el-upload

                        :file-list="fileList"
                        :action="actionUrl"
                        list-type="picture-card"
                        :on-preview="preView"
                        :on-success="uploadok"
                        :on-remove="remove">
                        <i class="el-icon-plus"></i>
                      </el-upload>
                  </el-form-item>
                </el-form>

            </div>

          <span slot="footer" class="dialog-footer">
            <el-button @click="ediDialog = false">取 消</el-button>
            <el-button type="primary" @click="onEdit">确 定</el-button>
          </span>
        </el-dialog>

    </d2-container>
</template>
<script>
export default {
  data () {
    return {
      fileList: [],
      loading: false,
      dialogVisible: false,
      ediDialog: false,
      tabelData: [],
      options: [],
      page: 1,
      limit: 20,
      total: 0,
      name: '',
      actionUrl: 'http://127.0.0.1:7001/api/v1/common/upload',
      form: {
        name: '',
        address: '',
        lat: '',
        lng: '',
        streetNum: '',
        imgs: ''
      },
      editform: {
        name: '',
        address: '',
        lat: '',
        lng: '',
        streetNum: '',
        imgs: ''
      },
      editGps: {

      },
      rules: {
        name: [
          { required: true, message: '请填写房产名称', trigger: 'blur' },
          { min: 3, message: '长度在 不能小于3位长度', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请填写地址', trigger: 'blur' }
        ]
      },
      curEditRow: null

      // name, address, lat, lng, streetNum, imgs,
    }
  },
  watch: {
    page () {
      this.getList()
    },
    name () {
      this.getList()
    }
  },
  created () {
    this.getList()
  },
  methods: {
    preView () {

    },
    remove () {

    },
    onEdit () {
      this.$refs.editform.validate(async (res, wtf) => {
        if (res) {
          console.log('this.options', this.options)
          console.log('this.editform.address', this.editform.address)
          const loc = this.options.find(r => r.label === this.editform.address)
          console.log('loca',loc)
          const { location, address } = loc ? loc.loc : {}
          const { lat, lng } = location || {}
          const postData = {
            buildId: this.curEditRow.buildId,
            name: this.editform.name,
            address: address || this.curEditRow.address,
            streetNum: address || this.curEditRow.streetNum,
            lat: lat || this.curEditRow.lat,
            lng: lng || this.curEditRow.lng,
            imgs: this.fileList.map(item => {
              if (item.response) return item.response.data
              return item.url
            }).join(',')
          }

          const res = await this.$api.post('/build/update', postData)

          const { success } = res.data
          if (!success) return this.$message.warning('操作失败')
          this.$message.success('操作成功')
          this.getList()
          this.$refs.editform.resetFields() // 重置表单
          this.fileList = []
          this.ediDialog = false
        }
      })
    },
    showEdDialog (row) {
      console.log(row)
      this.ediDialog = true
      this.editform = row
      this.curEditRow = { ...row }
      this.fileList = row.imgs.split(',').map(item => {
        const name = item
        const url = item
        return {
          name, url
        }
      })
      console.log('this.curEditRow', this.curEditRow)
    },
    async doDel (row) {
      console.log('row', row)
      const res = await this.$api.post('/build/remove', { buildId: row.buildId })
      const { success } = res.data
      if (success) {
        this.$notify.success('删除成功')
        this.getList()
      } else {
        this.$notify.error('删除失败')
      }
    },
    handleClose (done) {
      // 在关闭之前 清空表单
      this.$refs.form.resetFields() // 重置表单
      this.fileList = []
      done()
    },
    uploadok (response, file, fileList) {
      console.log(response, file, fileList)
      this.fileList = fileList
    },
    async remoteMethod (query) {
      this.loading = true
      const res = await this.$api.post('/common/bdSearch', { keyword: query })
      console.log('res', res)
      const { result } = res.data.data
      this.options = result.map(item => ({ label: item.name, value: item.name, loc: item }))
      this.loading = false
    },

    onSubmit (isedit) {
      this.$refs.form.validate(async (res, wtf) => {
        if (res) {
          // 才去执行提交
          console.log(this.form)
          // name, address, lat, lng, streetNum, imgs, desc, dianFee, waterFee
          const loc = this.options.find(r => r.label === this.form.address)
          console.log('loc', loc)
          const { location, address } = loc ? loc.loc : {}

          const { lat, lng } = location
          console.log('fileList', this.fileList)
          const postData = {
            name: this.form.address,
            address,
            streetNum: address,
            lat,
            lng,
            imgs: this.fileList.map(item => item.response.data).join(',')
          }
          console.log('postData', postData)

          const res = await this.$api.post('/build/add', postData)

          const { success } = res.data
          if (!success) return this.$message.warning('操作失败')
          this.$message.success('操作成功')
          this.getList()
          this.$refs.form.resetFields() // 重置表单
          this.fileList = []
          this.dialogVisible = false
        }
      })
    },
    showDia () {
      this.dialogVisible = true
    },
    handlePageChange (res) {
      this.page = res
    },
    async getList () {
      const postData = {
        limit: this.limit,
        page: this.page
      }
      if (this.name) postData.name = this.name

      const res = await this.$api.post('/build/queryBuild', postData)
      const { success, data } = res.data
      if (success) {
        this.tabelData = data.rows
        this.total = data.count
      }
    }
  }
}
</script>
